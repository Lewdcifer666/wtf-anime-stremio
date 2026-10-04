import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { validateResearchPacket } from '../scripts/validate-research-packet.mjs';
import { finalizeResearch, writeFinalized, loadFinalizerInputs } from '../scripts/finalize-research.mjs';
import { validatePublication } from '../scripts/validate-publication.mjs';
import { makePolicy, requiredFor, scoreItem } from '../scripts/dna-score.mjs';
import { fixture, clone, options, inFixture } from './fixtures/research/helpers.mjs';
const { inputs, packet } = fixture();
assert.equal(inputs.research.genre, 'anime');
assert.equal(inputs.research.require_all_known, false);
const row=inputs.catalogs.catalogs.find(row=>row.id==='dna-match');
const policy=makePolicy(inputs.profile);
const required=new Set(requiredFor(policy,row));
const nullable=inputs.profile.dna_dimensions.dimensions.map(d=>d.id).filter(d=>!required.has(d));
assert.deepEqual(nullable,['pace_speed']);
const accepted=clone(packet);
accepted.candidates[0].dna.pace_speed=null;
assert.deepEqual(validateResearchPacket(accepted,{...inputs,now:options.now}),[]);
const final=finalizeResearch(accepted,inputs,options);
assert.equal(final.log.accepted,1);
assert.equal(final.discovery.items[0].dna.pace_speed,null);
assert.equal(final.discovery.items[0].match_score,scoreItem(policy,row,packet.candidates[0],new Map()).score);
for(const dimension of required) {
 const unknown=clone(accepted); unknown.candidates[0].dna[dimension]=null;
 assert.deepEqual(validateResearchPacket(unknown,{...inputs,now:options.now}),[]);
 assert.equal(finalizeResearch(unknown,inputs,options).log.accepted,0,dimension);
 assert.equal(unknown.candidates[0].dna[dimension],null);
}
for(const host of inputs.research.blocked_source_hosts) {
 const trailer=clone(packet); trailer.candidates[0].sources[1].url='https://www.'+host+'/evidence';
 assert.ok(validateResearchPacket(trailer,{...inputs,now:options.now}).length);
}
const kitsu=clone(accepted); kitsu.candidates[0].external_ids={kitsu:'123'};
assert.deepEqual(validateResearchPacket(kitsu,{...inputs,now:options.now}),[]);
const withKitsu=finalizeResearch(kitsu,inputs,options);
assert.deepEqual(withKitsu.discovery.items[0].external_ids,{kitsu:'123'});
assert.equal(withKitsu.discovery.items[0].match_score,final.discovery.items[0].match_score);
assert.equal(withKitsu.discovery.items[0].imdb_id,final.discovery.items[0].imdb_id);
await inFixture(async root=>{
 const finalized=finalizeResearch(accepted,loadFinalizerInputs(root),options);
 await writeFinalized(root,finalized);
 assert.deepEqual(validatePublication(root,{now:Math.max(options.now,Date.now())}),[]);
 execFileSync(process.execPath,['scripts/validate.mjs'],{cwd:root,stdio:'pipe'});
 execFileSync(process.execPath,['test/anime-profile.test.mjs'],{cwd:root,stdio:'pipe'});
 // Merely claiming daily-automation cannot escape the legacy all-known census.
 const logPath=path.join(root,'data/run-logs',finalized.log.run_id+'.json');
 const log=JSON.parse(fs.readFileSync(logPath)); delete log.publication;
 fs.writeFileSync(logPath,JSON.stringify(log));
 assert.throws(()=>execFileSync(process.execPath,['test/anime-profile.test.mjs'],{cwd:root,stdio:'pipe'}));
});
console.log('anime research: declared nullability, provenance-gated census, source policy and genre metadata passed');
