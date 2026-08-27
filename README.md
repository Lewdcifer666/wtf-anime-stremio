# wtf-anime-stremio

WTF Anime Discovery - Automated anime built on out-thinking and hidden truth: psychological strategy, cat-and-mouse, deep power systems and visible progression, supernatural and strange worlds - with horror, gore and brutality treated as wanted properties rather than costs.

**Manifest ID:** `com.github.wtfanime.discovery`

## Catalog rows

- Full Watchlist
- 🔥 Past 24h Findings
- ⭐ Best Matches
- 🧬 DNA Match
- 🧠 Psychological Mystery
- 🔥 Powers & Progression
- 👹 Dark Supernatural
- 🩸 Gore / Horror
- 🛰️ Sci-Fi & Reality Weirdness
- 🌌 Strange Worlds
- 🤯 WTF Comedy
- ⚔️ High Action

Each row is emitted for both `movie` and `series`, so Stremio shows 24 catalogs.

## Independence

This repository is self-contained. It has no runtime or build-time dependency on
any other WTF Discovery addon, on their GitHub Pages deployments, or on the
scaffold generator that created it. It validates, builds and deploys alone.

## The vendored engine

Everything in `scripts/` except `registry.mjs` and `known-ids.mjs` is vendored
verbatim from the canonical template and **must not be edited here**.
`test/engine-checksum.test.mjs` fails if one of those files changes locally.
Engine changes go into the template first, then get regenerated into every repo.

`registry.mjs` (this addon's frozen DNA vocabulary) and `known-ids.mjs` are
generated once from this addon's own profile and are owned by this repository.

## Commands

```bash
npm test              # full suite, production-state census last
npm run validate      # fail-closed validation of data/ against the profile
npm run build         # build site/ (manifest + catalog JSON)
```
