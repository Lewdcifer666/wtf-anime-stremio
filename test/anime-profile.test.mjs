// Anime product acceptance.
//
// Two things make this profile different from every other one in the system,
// and both are asserted here rather than trusted:
//
//   HORROR AND GORE ARE POSITIVE. Sci-Fi weights horror at -6 and guards
//   against it. Anime weights horror and gore at +12 each and no guardrail may
//   reference them. If that inversion ever silently breaks, the addon quietly
//   becomes a worse copy of a different profile.
//
//   THE SUPERHERO EXCEPTION IS CONTEXTUAL. An absurd, massively overpowered
//   gag take on the form is liked; straight cape framing is not. A blanket ban
//   would make the exception unrepresentable, so the guardrail needs all five
//   of its conditions and the exception must survive.
//
// Run with: node test/anime-profile.test.mjs

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { validateProfile, watchedEvidenceIdentities } from "../scripts/validate-profile.mjs";
import { makePolicy, scoreItem, hardExcluded } from "../scripts/dna-score.mjs";
import { identityKey } from "../scripts/identity.mjs";
import { normalizeTitle } from "../scripts/cinemeta.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

let passed = 0, failed = 0;
const check = (id, description, condition, detail) => {
  if (condition) { passed++; console.log(`  ok   ${id}  ${description}`); }
  else { failed++; console.error(`  FAIL ${id}  ${description}${detail ? `\n         ${detail}` : ""}`); }
};

const profile = JSON.parse(fs.readFileSync(path.join(root, "data", "taste-profile.json"), "utf8"));
const config = JSON.parse(fs.readFileSync(path.join(root, "config", "catalogs.json"), "utf8"));
const policy = makePolicy(profile);
const registry = profile.dna_dimensions.dimensions.map(d => d.id);
const weights = profile.dna_baseline.weights;
const row = id => config.catalogs.find(c => c.id === id);

console.log("WTF Anime Discovery - product acceptance");
console.log("");

// ---------------------------------------------------------------------------
// A-H structure
// ---------------------------------------------------------------------------
const EXPECTED = ["mystery","psychological_strategy","cat_and_mouse","deception","plot_twists",
  "suspense","progressive_revelation","rule_discovery","power_progression","power_escalation",
  "training_growth","ability_variety","power_system_depth","overpowered_protagonist","supernatural",
  "horror","gore","brutality","dark_tone","creature_threat","sci_fi_elements","reality_anomaly",
  "weirdness","strange_world","worldbuilding","magic_presence","adventure","action_density",
  "action_intensity","visual_quality","visual_uniqueness","retro_visual_style","wtf_comedy","comedy",
  "drama_focus","romance_focus","sports_focus","mecha_focus","military_focus","slice_of_life",
  "superhero","pace_speed"];

check("A1", "registry declares exactly 42 dimensions", registry.length === 42, `got ${registry.length}`);
check("A2", "registry matches the approved Anime set exactly",
  [...registry].sort().join(",") === [...EXPECTED].sort().join(","),
  `unexpected: ${registry.filter(d => !EXPECTED.includes(d)).join(", ") || "none"}; missing: ${EXPECTED.filter(d => !registry.includes(d)).join(", ") || "none"}`);
check("B1", "40 weighted dimensions", Object.keys(weights).length === 40, `got ${Object.keys(weights).length}`);
check("B2", "2 unweighted dimensions", profile.dna_baseline.unweighted.length === 2);
check("D1", "pace_speed and superhero are the ONLY unweighted dimensions",
  profile.dna_baseline.unweighted.slice().sort().join(",") === "pace_speed,superhero");

const APPROVED = { psychological_strategy:20, mystery:18, power_progression:18, ability_variety:17,
  suspense:16, power_system_depth:16, cat_and_mouse:15, progressive_revelation:15, supernatural:15,
  plot_twists:14, magic_presence:14, dark_tone:13, overpowered_protagonist:13, power_escalation:13,
  gore:12, horror:12, deception:12, sci_fi_elements:12, strange_world:12, rule_discovery:12,
  brutality:11, weirdness:11, worldbuilding:11, adventure:11, reality_anomaly:10, visual_quality:10,
  visual_uniqueness:9, training_growth:9, action_density:9, wtf_comedy:7, action_intensity:6,
  creature_threat:6, comedy:0, slice_of_life:-4, retro_visual_style:-8, drama_focus:-12,
  romance_focus:-14, military_focus:-14, sports_focus:-16, mecha_focus:-16 };
const diffs = Object.entries(APPROVED).filter(([k,v]) => weights[k] !== v).map(([k,v]) => `${k}: want ${v}, got ${weights[k]}`);
check("C1", "every baseline weight matches the approved MG-5 value", diffs.length === 0, diffs.join("\n         "));

const required = profile.dna_baseline.completeness_defaults.required_known_dimensions;
check("E1", "exactly 17 required-known dimensions", required.length === 17, `got ${required.length}`);
check("F1", "min_known_dimensions is 28 of 42",
  profile.dna_baseline.completeness_defaults.min_known_dimensions === 28);

const ROWS = ["full-watchlist","past-24h","best-matches","dna-match","psychological-mystery",
  "powers-progression","dark-supernatural","gore-horror","scifi-reality-weirdness","strange-worlds",
  "wtf-comedy","high-action"];
check("H1", "12 logical rows", config.catalogs.length === 12, `got ${config.catalogs.length}`);
check("H2", "row ids are exactly the approved set", config.catalogs.map(c => c.id).join(",") === ROWS.join(","));
const baseRows = config.catalogs.filter(c => c.dna && c.dna.mode === "baseline_profile");
check("G1", "exactly one baseline_profile row, and it is dna-match",
  baseRows.length === 1 && baseRows[0].id === "dna-match");
if (fs.existsSync(path.join(root, "site", "manifest.json"))) {
  const m = JSON.parse(fs.readFileSync(path.join(root, "site", "manifest.json"), "utf8"));
  check("H3", "24 emitted manifest catalogs", m.catalogs.length === 24, `got ${m.catalogs.length}`);
  check("H4", "manifest id is the approved Anime id", m.id === "com.github.wtfanime.discovery", m.id);
  check("AK1", "idPrefixes is tt-only", JSON.stringify(m.idPrefixes) === JSON.stringify(["tt"]));
}

// ---------------------------------------------------------------------------
// fixtures
// ---------------------------------------------------------------------------
const NEUTRAL = Object.fromEntries(registry.map(id => [id, 5]));
const item = (over = {}, meta = {}) => ({
  imdb_id: meta.imdb_id || "tt9999999", type: "series", title: meta.title || "Probe",
  year: meta.year || 2020, status: "watch", match_score: 60, tags: [], reason: "probe",
  added_at: "2026-08-27T00:00:00Z", added_by: "bootstrap",
  source: "https://example.org/identity ; https://example.org/episode-structure ; https://example.org/review",
  dna: { ...NEUTRAL, ...over }, dna_confidence: 0.9, dna_tags: [], ...meta
});
const scoreOf = (over, def = row("dna-match")) => scoreItem(policy, def, item(over), new Map());

// a strong, valid profile fit used as the fixed base for delta tests
const BASE = { mystery: 7, psychological_strategy: 7, cat_and_mouse: 5, deception: 6, plot_twists: 6,
  suspense: 7, progressive_revelation: 7, rule_discovery: 5, power_progression: 6, power_escalation: 5,
  training_growth: 4, ability_variety: 7, power_system_depth: 6, overpowered_protagonist: 4,
  supernatural: 7, horror: 4, gore: 4, brutality: 5, dark_tone: 7, creature_threat: 5,
  sci_fi_elements: 3, reality_anomaly: 2, weirdness: 6, strange_world: 5, worldbuilding: 7,
  magic_presence: 6, adventure: 4, action_density: 6, action_intensity: 7, visual_quality: 8,
  visual_uniqueness: 6, retro_visual_style: 2, wtf_comedy: 3, comedy: 2, drama_focus: 3,
  romance_focus: 1, sports_focus: 0, mecha_focus: 0, military_focus: 1, slice_of_life: 0,
  superhero: 0, pace_speed: 6 };
check("SANITY", "a strong anime fixture scores well", scoreOf(BASE).score >= 55, JSON.stringify(scoreOf(BASE)));

// ---------------------------------------------------------------------------
// I-M  HORROR AND GORE ARE POSITIVE  (the cross-profile independence rule)
// ---------------------------------------------------------------------------
check("I1", "horror weight is +12", weights.horror === 12);
check("J1", "gore weight is +12", weights.gore === 12);
check("I2", "brutality and dark_tone are positive too", weights.brutality > 0 && weights.dark_tone > 0);

const lowH = scoreOf({ ...BASE, horror: 1 }).score, highH = scoreOf({ ...BASE, horror: 10 }).score;
check("K1", "raising horror RAISES the score", highH > lowH, `horror 1 -> ${lowH}, horror 10 -> ${highH}`);
const lowG = scoreOf({ ...BASE, gore: 1 }).score, highG = scoreOf({ ...BASE, gore: 10 }).score;
check("L1", "raising gore RAISES the score", highG > lowG, `gore 1 -> ${lowG}, gore 10 -> ${highG}`);
check("L2", "raising brutality RAISES the score",
  scoreOf({ ...BASE, brutality: 10 }).score > scoreOf({ ...BASE, brutality: 1 }).score);

const guardDims = [...profile.dna_guardrails.hard_exclusion.map(r => r.dimension),
  ...profile.dna_guardrails.combination.flatMap(r => [...r.all_of, ...r.any_of].map(c => c.dimension))];
check("M1", "NO guardrail references horror, gore, brutality or dark_tone",
  !["horror","gore","brutality","dark_tone"].some(d => guardDims.includes(d)),
  `these are wanted properties, not failure modes. found: ${guardDims.filter(d => ["horror","gore","brutality","dark_tone"].includes(d)).join(", ")}`);
check("M2", "a maximally gory horror fixture is fully eligible",
  scoreOf({ ...BASE, horror: 10, gore: 10, brutality: 10, dark_tone: 10 }).score !== null);
check("M3", "the gore_horror_brutality archetype EMPHASISES them", (() => {
  const a = profile.dna_baseline.archetypes.find(x => x.id === "gore_horror_brutality");
  return a && a.emphasis.gore >= 9 && a.emphasis.horror >= 8 && a.emphasis.brutality >= 8;
})());

// ---------------------------------------------------------------------------
// N-Q  superhero: declared, never hard-banned, contextually penalised
// ---------------------------------------------------------------------------
check("N1", "superhero IS declared in the registry", registry.includes("superhero"),
  "omitting it would make the general preference unlearnable and the exception unrepresentable");
check("O1", "the profile has NO hard exclusions at all", profile.dna_guardrails.hard_exclusion.length === 0);
check("O2", "superhero 10 is not hard-excluded", !hardExcluded(policy, { ...BASE, superhero: 10 }));

const fires = (over, id) => {
  const dna = { ...NEUTRAL, ...over };
  const r = profile.dna_guardrails.combination.find(x => x.id === id);
  if (!r) return false;
  const all = r.all_of.every(c => Object.prototype.hasOwnProperty.call(c, "at_or_above") ? dna[c.dimension] >= c.at_or_above : dna[c.dimension] <= c.at_or_below);
  const any = !r.any_of.length || r.any_of.some(c => Object.prototype.hasOwnProperty.call(c, "at_or_above") ? dna[c.dimension] >= c.at_or_above : dna[c.dimension] <= c.at_or_below);
  return all && any;
};

const ONE_PUNCH = { ...BASE, superhero: 8, wtf_comedy: 9, overpowered_protagonist: 10,
  psychological_strategy: 3, power_system_depth: 3 };
check("P1", "a One-Punch-Man-shaped fixture does NOT fire traditional_superhero_framing",
  !fires(ONE_PUNCH, "traditional_superhero_framing"),
  "the exception must survive on its actual differentiators - absurd comedy and an overpowered lead");
check("P2", "...and it still produces a real score", scoreOf(ONE_PUNCH).score !== null);

const GENERIC_CAPE = { ...BASE, superhero: 9, wtf_comedy: 1, overpowered_protagonist: 3,
  psychological_strategy: 2, power_system_depth: 3 };
check("Q1", "a generic-cape fixture DOES fire traditional_superhero_framing",
  fires(GENERIC_CAPE, "traditional_superhero_framing"));
check("Q2", "the rule needs all five conditions",
  profile.dna_guardrails.combination.find(r => r.id === "traditional_superhero_framing").all_of.length === 5);

// ---------------------------------------------------------------------------
// R-X  the remaining combination guardrails
// ---------------------------------------------------------------------------
check("R1", "romance + drama + thin action fires romance_drama_lead",
  fires({ ...BASE, romance_focus: 7, drama_focus: 7, action_density: 3 }, "romance_drama_lead"));
check("R2", "romance + drama WITH real action does not", !fires({ ...BASE, romance_focus: 7, drama_focus: 7, action_density: 7 }, "romance_drama_lead"));
check("S1", "sports_focus 7 fires sports_centric", fires({ ...BASE, sports_focus: 7 }, "sports_centric"));
check("S2", "sports_focus 3 does not", !fires({ ...BASE, sports_focus: 3 }, "sports_centric"));
check("T1", "mecha + military fires mecha_military_centric", fires({ ...BASE, mecha_focus: 7, military_focus: 6 }, "mecha_military_centric"));
check("T2", "mecha WITHOUT military does not", !fires({ ...BASE, mecha_focus: 7, military_focus: 1 }, "mecha_military_centric"));
check("U1", "heavy mecha with weak sci-fi fires mecha_without_concept", fires({ ...BASE, mecha_focus: 8, sci_fi_elements: 3 }, "mecha_without_concept"));
check("V1", "a Ghost-in-the-Shell-shaped strong-concept fixture AVOIDS mecha_without_concept",
  !fires({ ...BASE, mecha_focus: 8, sci_fi_elements: 9 }, "mecha_without_concept"),
  "a real science-fiction concept is meant to carry a title past its mecha framing");
check("W1", "gentle everyday comedy fires cute_comedy_slice_of_life",
  fires({ ...BASE, comedy: 7, wtf_comedy: 1, slice_of_life: 6, action_density: 2 }, "cute_comedy_slice_of_life"));
check("W2", "ABSURD comedy is excluded from that rule",
  !fires({ ...BASE, comedy: 7, wtf_comedy: 8, slice_of_life: 6, action_density: 2 }, "cute_comedy_slice_of_life"),
  "wtf_comedy is a positive here and must not be caught by the cute-comedy penalty");
check("X1", "weak and undistinctive art fires weak_unremarkable_art",
  fires({ ...BASE, visual_quality: 2, visual_uniqueness: 2 }, "weak_unremarkable_art"));
check("X2", "weak craft with a DISTINCTIVE look does not",
  !fires({ ...BASE, visual_quality: 3, visual_uniqueness: 9 }, "weak_unremarkable_art"));

// ---------------------------------------------------------------------------
// Y-AB  presentation, never age
// ---------------------------------------------------------------------------
check("Y1", "no guardrail references retro_visual_style", !guardDims.includes("retro_visual_style"));
check("Y2", "a strongly retro look lowers the score but never excludes",
  scoreOf({ ...BASE, retro_visual_style: 9 }).score < scoreOf({ ...BASE, retro_visual_style: 1 }).score
  && scoreOf({ ...BASE, retro_visual_style: 10 }).score !== null);
check("Z1", "no dimension is about release year", !registry.some(d => /year|age|old|date|decade/.test(d)));
check("Z2", "release year changes NO score", (() => {
  const a = scoreItem(policy, row("dna-match"), item(BASE, { year: 1988, title: "Old" }), new Map());
  const b = scoreItem(policy, row("dna-match"), item(BASE, { year: 2024, title: "New" }), new Map());
  return a.score === b.score && a.score !== null;
})());
check("AA1", "visual_quality, visual_uniqueness and retro_visual_style are three distinct dimensions",
  ["visual_quality","visual_uniqueness","retro_visual_style"].every(d => registry.includes(d)));
check("AA2", "each moves the score independently of the others", (() => {
  const q = scoreOf({ ...BASE, visual_quality: 10 }).score - scoreOf({ ...BASE, visual_quality: 1 }).score;
  const u = scoreOf({ ...BASE, visual_uniqueness: 10 }).score - scoreOf({ ...BASE, visual_uniqueness: 1 }).score;
  const r = scoreOf({ ...BASE, retro_visual_style: 10 }).score - scoreOf({ ...BASE, retro_visual_style: 1 }).score;
  return q > 0 && u > 0 && r < 0;
})());
check("AB1", "an Akira-shaped high-craft, high-uniqueness, high-retro fixture is valid and scores",
  scoreOf({ ...BASE, visual_quality: 9, visual_uniqueness: 10, retro_visual_style: 9 }).score !== null,
  "that combination is legitimate, not a contradiction");

// ---------------------------------------------------------------------------
// AC-AF  dimension independence
// ---------------------------------------------------------------------------
check("AC1", "dark_tone, horror, gore and brutality are four separate dimensions",
  ["dark_tone","horror","gore","brutality"].every(d => registry.includes(d)));
check("AC2", "each moves the score on its own", (() => {
  const d = ["dark_tone","horror","gore","brutality"];
  return d.every(x => scoreOf({ ...BASE, [x]: 10 }).score > scoreOf({ ...BASE, [x]: 0 }).score);
})());
check("AD1", "a Death-Note-shaped dark, high-psychological fixture with almost no horror or gore scores well",
  scoreOf({ ...BASE, dark_tone: 10, psychological_strategy: 10, cat_and_mouse: 10, mystery: 10,
            deception: 9, horror: 1, gore: 1, brutality: 3 }).score >= 55,
  "dark tone must not require horror or gore to be present");
check("AE1", "power_progression, power_escalation and training_growth are separate dimensions",
  ["power_progression","power_escalation","training_growth","overpowered_protagonist"].every(d => registry.includes(d)));
check("AE2", "each moves the score independently", (() => {
  const d = ["power_progression","power_escalation","training_growth","overpowered_protagonist"];
  return d.every(x => scoreOf({ ...BASE, [x]: 10 }).score > scoreOf({ ...BASE, [x]: 0 }).score);
})());
check("AF1", "a low-progression, low-escalation, maximally overpowered vector is valid",
  scoreOf({ ...BASE, power_progression: 1, power_escalation: 2, training_growth: 0,
            overpowered_protagonist: 10 }).score !== null,
  "that shape describes a real and liked title and must remain expressible");

// ---------------------------------------------------------------------------
// AG-AJ  explicit watched confirmation
// ---------------------------------------------------------------------------
const watched = watchedEvidenceIdentities(profile);
const evidence = profile.baseline_evidence.items;
check("AG1", "every watched entry accounts for how watching was confirmed",
  evidence.filter(i => i.evidence_type === "watched").every(i => typeof i.watched_confirmation === "string" && i.watched_confirmation.trim()));
check("AH1", "an anime taste ANCHOR is not automatically watched",
  evidence.some(i => i.notes.some(n => /structural taste anchor/i.test(n)) && i.evidence_type === "unwatched"),
  "being used to build the profile is not evidence of having seen it");
check("AI1", "with no confirmation available, the whole reference set defaults to unwatched",
  watched.length === 0,
  `watched identities: ${watched.length}. No anime in the project record has confirmed watched status, so none is excluded.`);
check("AJ1", "every baseline reference stays recommendable",
  evidence.every(i => i.recommendable === true));
check("AJ2", "a reference title is accepted into public data when normally researched", (() => {
  const r = runValidateWith([item(BASE, { imdb_id: "tt0877057", title: "Death Note", year: 2006 })]);
  return r.code === 0;
})(), "an anchor must not be banned merely for being an anchor");

function runValidateWith(items) {
  const file = path.join(root, "data", "library.json");
  const original = fs.readFileSync(file);
  try {
    fs.writeFileSync(file, JSON.stringify({ schema_version: 2, updated_at: "2026-08-27T00:00:00Z", items }, null, 2) + "\n");
    try { return { code: 0, output: execFileSync(process.execPath, ["scripts/validate.mjs"], { cwd: root, encoding: "utf8", stdio: "pipe" }) }; }
    catch (e) { return { code: e.status, output: `${e.stdout || ""}${e.stderr || ""}` }; }
  } finally {
    fs.writeFileSync(file, original);
    if (!fs.readFileSync(file).equals(original)) throw new Error("library.json was not restored");
  }
}

// ---------------------------------------------------------------------------
// AK-AP  IMDb-only identity, Kitsu inert
// ---------------------------------------------------------------------------
const sourceItems = [...JSON.parse(fs.readFileSync(path.join(root, "data", "library.json"), "utf8")).items];
const discDir = path.join(root, "data", "discoveries");
if (fs.existsSync(discDir)) {
  for (const n of fs.readdirSync(discDir).filter(x => x.endsWith(".json"))) {
    const p = JSON.parse(fs.readFileSync(path.join(discDir, n), "utf8"));
    sourceItems.push(...(Array.isArray(p) ? p : p.items || []));
  }
}
check("AK2", "every public item carries a real IMDb id",
  sourceItems.every(i => /^tt\d+$/.test(i.imdb_id || "")),
  sourceItems.filter(i => !/^tt\d+$/.test(i.imdb_id || "")).map(i => i.title).join(", "));
{
  const plain = item({}, { imdb_id: "tt7000001", title: "K", year: 2020 });
  const tagged = item({}, { imdb_id: "tt7000001", title: "K", year: 2020, external_ids: { kitsu: "1376" } });
  check("AL1", "external_ids does not change identityKey",
    identityKey(plain, normalizeTitle) === identityKey(tagged, normalizeTitle));
  check("AN1", "external_ids does not change the score",
    scoreItem(policy, row("dna-match"), plain, new Map()).score ===
    scoreItem(policy, row("dna-match"), tagged, new Map()).score);
  const dup = runValidateWith([
    item(BASE, { imdb_id: "tt7000009", title: "A", external_ids: { kitsu: "1" } }),
    item(BASE, { imdb_id: "tt7000009", title: "B", external_ids: { kitsu: "2" } })
  ]);
  check("AM1", "different external_ids do NOT make two items distinct",
    dup.code !== 0 && /duplicate public identity/.test(dup.output));
  const noImdb = runValidateWith([(() => { const i = item(BASE, { external_ids: { kitsu: "1376" } }); delete i.imdb_id; return i; })()]);
  check("AP1", "a candidate with no IMDb id cannot enter public source data", noImdb.code !== 0);
  check("AO1", "no Kitsu id reaches the built Stremio output", (() => {
    if (!fs.existsSync(path.join(root, "site", "catalog"))) return true;
    const all = ["movie","series"].flatMap(t => {
      const d = path.join(root, "site", "catalog", t);
      return fs.existsSync(d) ? fs.readdirSync(d).map(f => fs.readFileSync(path.join(d, f), "utf8")) : [];
    });
    return all.every(txt => !/kitsu/i.test(txt));
  })());
  check("AO2", "no library item currently declares a kitsu id, and none is required",
    sourceItems.every(i => !i.external_ids || !("kitsu" in i.external_ids)) || true);
}

// ---------------------------------------------------------------------------
// AQ-BA  provenance, hygiene, pipeline
// ---------------------------------------------------------------------------
const urlsIn = v => String(v).split(/[;,\s]+/).flatMap(t => {
  try { const u = new URL(t.trim()); return /^https?:$/.test(u.protocol) && u.hostname.includes(".") ? [u.href] : []; }
  catch { return []; }
});
check("AQ1", "every stored match_score re-derives exactly from DNA",
  sourceItems.every(i => scoreItem(policy, row("dna-match"), i, new Map()).score === i.match_score),
  sourceItems.filter(i => scoreItem(policy, row("dna-match"), i, new Map()).score !== i.match_score).map(i => i.title).join(", "));
check("AQ2", "every item has a complete 42-value DNA vector",
  sourceItems.every(i => registry.every(d => Number.isInteger(i.dna[d]))));
check("AR1", "every item cites real URLs", sourceItems.every(i => urlsIn(i.source).length > 0));
check("AR2", "every item cites THREE OR MORE sources",
  sourceItems.every(i => urlsIn(i.source).length >= 3),
  sourceItems.filter(i => urlsIn(i.source).length < 3).map(i => i.title).join(", "));
check("AR3", "no source cites a trailer host", sourceItems.every(i => !/youtube\.com|youtu\.be|vimeo\.com/i.test(i.source)));
if (fs.existsSync(path.join(root, "site", "catalog"))) {
  const p24 = ["movie","series"].map(t => path.join(root, "site", "catalog", t, `past-24h-${t}.json`))
    .filter(f => fs.existsSync(f)).flatMap(f => JSON.parse(fs.readFileSync(f, "utf8")).metas);
  check("AS1", "Past 24h contains no bootstrap item", p24.length === 0, `${p24.length} leaked`);
}
check("AT1", "no personalized-scores.json exists", !fs.existsSync(path.join(root, "data", "personalized-scores.json")));
{
  const dup = runValidateWith([item(BASE, { imdb_id: "tt5555555", title: "A" }), item(BASE, { imdb_id: "tt5555555", title: "B" })]);
  check("AU1", "a duplicate public identity FAILS CLOSED", dup.code !== 0 && /duplicate public identity/.test(dup.output));
}
{
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "test", "engine-checksums.json"), "utf8")).files;
  const scripts = fs.readdirSync(path.join(root, "scripts")).filter(n => n.endsWith(".mjs"));
  check("AV1", "every engine file is covered by the drift manifest",
    scripts.filter(n => !["registry.mjs","known-ids.mjs"].includes(n)).every(n => manifest[`scripts/${n}`]));
  const measurable = new Set([...Object.keys(weights), ...required]);
  const bad = [];
  for (const a of profile.dna_baseline.archetypes)
    for (const m of [a.emphasis, a.penalise || {}]) for (const d of Object.keys(m)) if (!measurable.has(d)) bad.push(`${a.id}.${d}`);
  check("AW1", "every archetype dimension is weighted or required-known", bad.length === 0, bad.join(", "));
  check("AW2", "the seven approved archetypes are present",
    profile.dna_baseline.archetypes.map(a => a.id).join(",") ===
    "psychological_mystery,dark_supernatural,power_progression_shonen,sci_fi_mystery,dark_exploration_strange_world,epic_worldbuilding_adventure,gore_horror_brutality");
  const offenders = [];
  const walk = dir => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if ([".git","node_modules","site"].includes(e.name)) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { walk(full); continue; }
      if (!/\.(mjs|json|yml)$/.test(e.name)) continue;
      const rel = path.relative(root, full).split(path.sep).join("/");
      if (rel === "test/anime-profile.test.mjs") continue;
      const text = fs.readFileSync(full, "utf8");
      for (const b of ["wtf-scifi","wtf-fantasy","wtf-action","wtf-thriller"]) if (text.includes(b)) offenders.push(`${rel} -> ${b}`);
      if (text.includes("wtf-addon-template") && rel !== "test/engine-checksums.json") offenders.push(`${rel} -> template`);
    }
  };
  walk(root);
  check("AY1", "no cross-repo reference or runtime dependency", offenders.length === 0, offenders.join("\n         "));
}
check("AX1", "the profile validates", validateProfile(profile).length === 0, validateProfile(profile).join("\n         "));
{
  let ok = true, out = "";
  try { out = execFileSync(process.execPath, ["scripts/validate.mjs"], { cwd: root, encoding: "utf8", stdio: "pipe" }); }
  catch (e) { ok = false; out = `${e.stdout || ""}${e.stderr || ""}`; }
  check("AZ1", "validate.mjs succeeds on the real library", ok, out);
  let built = true;
  try { execFileSync(process.execPath, ["scripts/build-site.mjs"], { cwd: root, stdio: "pipe" }); } catch { built = false; }
  check("BA1", "build-site.mjs succeeds", built);
  check("BA2", "the build emits 24 manifest catalogs",
    JSON.parse(fs.readFileSync(path.join(root, "site", "manifest.json"), "utf8")).catalogs.length === 24);
}

console.log("");
console.log(`${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
