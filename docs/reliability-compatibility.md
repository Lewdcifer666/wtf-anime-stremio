# Anime compatibility audit

Prepared against `affd12530d934abcad5ab234cd8c2164f8a1a93f`. This is a dormant
code migration; its local validation does not satisfy the live Thriller pilot
gate or authorize changing the saved task, publisher installation or settings.

The existing profile, catalog configuration, frozen registry, seed identities,
library, discoveries, run logs, rejections, compact state and personalization
files retain their original bytes. Existing package scripts and the Pages
schedule (`47 * * * *`) are preserved. The discovery task stays at 10:30
Europe/Berlin with its existing rotator.

Anime has 42 DNA dimensions, 40 weighted dimensions, a minimum of 28 known
dimensions, confidence floor 0.6 and 17 explicitly required-known dimensions.
The unchanged DNA Match scorer requires the union of weighted and required-known
dimensions: only `pace_speed` may be null for a new otherwise eligible item.
Unknown is never zero. Publication and best thresholds remain 58 and 67;
daily limits remain five movies and three series. Positive horror/gore weights,
the contextual superhero exception, archetypes and guardrails remain unchanged.

The old product acceptance test dynamically required all public DNA dimensions
to be integers, beyond the profile's declared semantics. That census remains
for legacy and bootstrap items. Only new items associated with a version 1
publication-provenance run log use the profile/scorer eligibility check and
integer/null representation. Merely setting `added_by` does not qualify.
Regression fixtures finalize a candidate with unknown `pace_speed`, run source
and Anime acceptance validation, and prove required-known/weighted unknowns
still fail. Removing the corresponding log provenance restores the strict
legacy census and fails that fixture.

The old runbook aimed for two sources, but the existing active acceptance suite
requires at least three distinct source documents, evidence beyond bare
Cinemeta metadata and no YouTube, youtu.be or Vimeo evidence. Research intake
preserves those active requirements, with whole-season or whole-series evidence
for series. The stricter active checks were not relaxed to match old task prose.

IMDb remains the canonical public identity. Optional `external_ids.kitsu`
passes through as inert metadata; regression tests verify it changes neither
canonical identity nor score. It cannot replace a missing IMDb identity or
alter catalog routing or deduplication. Unresolved identities stay qualitative
research rejections.

The only new dependency is pinned Ajv 8.20.0. No cross-repository runtime
dependency was introduced. Private feedback learning remains required unfinished
work, and this migration neither activates nor refreshes personalization.
