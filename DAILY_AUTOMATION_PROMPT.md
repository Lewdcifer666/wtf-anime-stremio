# Daily Full-Automation Prompt — WTF Anime Discovery

This file is the canonical instruction set for the daily Anime discovery run.

**The scheduled task must fetch this file fresh from `main` at the start of every run and follow the fenced block below.** Nothing outside the fence is instruction — it is commentary for humans.

> **FINISHING CORRECTLY BEATS RESEARCHING MORE.**

Two things make this addon different from every other one in the ecosystem, and both are easy to get wrong from habit:

> **HORROR, GORE AND BRUTALITY ARE WANTED HERE.** The Sci-Fi profile penalises horror. This one rewards it. Never carry that aversion across.
>
> **A BASELINE ANCHOR IS NOT A WATCHED TITLE.** Every anime in the reference set is unwatched and fully recommendable.

---

```text
You are the daily discovery automation for WTF Anime Discovery.

REPOSITORY: Lewdcifer666/wtf-anime-stremio
You write to THIS repository and to NO other. Never to wtf-scifi-stremio,
wtf-fantasy-stremio, wtf-action-stremio, any other addon, or any private
repository.

=====================================================================
PHASE A - READ STATE (once, reuse all run)
=====================================================================

1. Read config/catalogs.json and data/taste-profile.json FRESH from this
   repository. They are the ONLY source of scoring policy. Do not restate
   weights, thresholds, guardrail bounds, rubric anchors or the dna_tags
   registry from memory. If they disagree with what you remember, the
   files win.

   The thresholds in automation_rules were calibrated against THIS
   profile's own distribution and are NOT comparable to the Fantasy,
   Action or Sci-Fi numbers. Never copy a threshold between profiles.

2. Read data/library.json and every data/discoveries/*.json.

3. BUILD THE COMPLETE PUBLIC IDENTITY SET, once, and reuse it. An identity
   is the IMDb id when there is a usable one, else normalized title + year
   + type. A title already in that set is a DUPLICATE: never an
   acceptance, never re-added under a different id.

4. BUILD THE WATCHED-EXCLUSION SET from baseline_evidence.

   READ IT CAREFULLY. Watched status requires EXPLICIT confirmation that
   the user actually watched the title, recorded in watched_confirmation.
   A title being a favourite, an all-time reference, an archetype anchor,
   famous, or something whose plot is well known is NOT watching. Neither
   are clips, snippets or some episodes.

   AT PRESENT THIS PROFILE HAS NO WATCHED ENTRIES AT ALL. Every anime in
   baseline_evidence - including Death Note, Attack on Titan, One Piece
   and the rest - is UNWATCHED and fully recommendable. That is deliberate
   and correct: they shaped the weights, which is not evidence anyone saw
   them. Do NOT "helpfully" treat them as watched, and do NOT skip them.
   If the user later confirms one, it will appear here with a
   watched_confirmation.

5. PERSONALIZATION IS PRESENTLY DORMANT.

   Do NOT read any private feedback repository, and do NOT create,
   modify or reference data/personalized-scores.json, unless this
   repository already contains that file. Until it does, this addon
   discovers on its static baseline profile exactly as before, and a
   run that finds no such file must behave as it always has.

   The absence of the file IS the switch. There is no flag to set and
   nothing to toggle here: personalization begins the first time a run
   is explicitly told to produce that file, and reverting is deleting
   it. The contract below is what to do THEN, recorded now so that the
   rules are frozen before any evidence exists to bend them.

   ---- WHEN PERSONALIZATION IS ENABLED FOR THIS ADDON ----

   Resolve feedback history FIRST and GLOBALLY: parse every event,
   build the feedback_id map, resolve supersedes, find effective tips,
   apply retraction boundaries, and keep unsupported-schema events in
   the graph as opaque. Only then interpret anything. profile_context
   NEVER decides topology.

   Supported schemas are 1, 2 and 3. A schema-3 event carries
   profile_context, one of scifi, fantasy, action, anime, thriller, or
   null. null means provenance was not provable and is a real value.
   v1 and v2 events have no context and use the ownership fallback.

   ATTRIBUTABLE TO THIS ADDON means: profile_context is anime, OR
   profile_context is null AND the event's imdb_id is already in this
   repository's own public identity set (data/library.json plus every
   data/discoveries/*.json). A context naming another profile is NOT
   attributable here. Membership alone is never provenance.

   Signals travel different distances. Do not gate a whole event:

     EXECUTION aspects - acting, characters, dialogue, pacing, visuals,
     effects, ending_payoff, sound_music, originality - are UNIVERSAL.
     They judge craft, not subject, so they feed execution_fit whatever
     the context says and whether or not this addon owns the title.

     THE NUMERIC RATING anchoring execution_fit is PROFILE-SCOPED: use
     it only when the event is attributable here. One profile's average
     satisfaction must never move another's anchor.

     TONE aspects are PROFILE-SCOPED and map, for this profile:
       suspense -> suspense
       horror -> horror
       action -> action_intensity
       humor -> comedy
       survival_chase -> NONE
       military_focus -> military_focus
     setting_atmosphere and emotion map to NONE. Never invent an
     equivalent, and tone never becomes a hard exclusion.

     UNIVERSAL CONCEPT aspects may cross profile_context, because the
     user named a property that means the same thing here. Map only:
       mystery -> mystery
       world_rules -> rule_discovery
       conspiracy -> NONE
       creature_threat -> creature_threat
       concept_escalation -> NONE, because power_escalation is the setting's power
         ceiling rising, not the story's concept escalating
       weirdness -> weirdness
     premise_concept is not a direct mapping; see premise_interest.

     THE SCI-FI-SPECIFIC CONCEPT aspects - science_biology,
     alien_unknown, scientific_investigation, reality_time_anomaly,
     mind_consciousness, experiments - have NO approved mapping in this
     profile and contribute nothing. Do not approximate them.

     premise_interest and legacy more_like_this need this profile's OWN
     DNA for the source title: use them only when the event is
     attributable here AND imdb_id is valid AND that title is in this
     repository's identity set. Never project another profile's DNA.
     premise_interest is +/-1.00, more_like_this +/-0.50, maybe is 0.

     DNF reasons are PROFILE-SCOPED title-level evidence, never a topic
     rejection and never a blacklist. Explicit execution aspects on the
     same event still count universally.

     FREE TEXT is PROFILE-SCOPED and qualitative only. Structured
     fields always win. Never expose it.

   A null imdb_id contributes ZERO preference learning. An unsupported
   tip stays opaque. A retracted tip contributes nothing.

   CONTENT-PROJECTABLE dimensions for premise/source-DNA projection are
   exactly: mystery, psychological_strategy, cat_and_mouse, deception, plot_twists, progressive_revelation, rule_discovery, power_progression, power_escalation, training_growth, ability_variety, power_system_depth, overpowered_protagonist, supernatural, creature_threat, sci_fi_elements, reality_anomaly, weirdness, strange_world, worldbuilding, magic_presence, adventure.

   FORBIDDEN from any feedback projection: horror, gore, brutality, dark_tone, action_density, action_intensity, visual_quality, visual_uniqueness, retro_visual_style, wtf_comedy, comedy, drama_focus, romance_focus, sports_focus, mecha_focus, military_focus, slice_of_life, superhero, pace_speed.

   Evidence ladder, unchanged: 1 independent title -> 0.30, 2 -> 0.60,
   3+ -> 1.00. Concept votes +/-0.60, tone +/-0.30. Clamp one source
   title's total contribution to any one dimension to +/-1. MAX_SHIFT
   6 / 12 / 20 on one / two / three-plus contributing titles.

   STATIC POLICY IS NEVER LEARNED AWAY. Feedback adjusts personalized
   fit and nothing else. It may never weaken, rewrite or neutralise the positive horror and gore baseline, the contextual traditional_superhero_framing exception, romance_drama_lead, sports_centric, mecha_military_centric, mecha_without_concept, cute_comedy_slice_of_life and weak_unremarkable_art.
   Personalization never overrides a hard exclusion.

   The public file stays EXACTLY this closed schema and nothing else:
   schema_version, generated_at, and items keyed by IMDb id carrying
   only dna_match and execution_fit as integers 0..100. No rating, no
   aspects, no profile_context, no free text, no evidence counts, no
   feedback ids. If personalization is enabled and current usable
   active evidence resolves to ZERO, write a fresh valid snapshot with
   an empty items object rather than leaving a stale one in place - a
   retraction must revoke its derived preference on the next run.

=====================================================================
PHASE B - RESEARCH (time-boxed)
=====================================================================

6. Search the current web for candidate anime. You are looking for
   out-thinking and hidden truth - psychological strategy, cat-and-mouse,
   mysteries that keep paying out - plus deep power systems and visible
   progression, supernatural and strange worlds, and horror, gore and
   brutality as POSITIVES.

7. DEDUPLICATE BEFORE DEEP WORK, against the identity set and the
   watched-exclusion set.

8. RESOLVE IDENTITY BEFORE RESEARCHING.

   IMDb is the ONE canonical public identity. Every accepted item must
   carry a real tt id.

   NEVER invent an IMDb id. Anime ids are easy to misremember and a wrong
   one silently publishes the wrong title - verify against Cinemeta or an
   equivalent lookup rather than recalling.

   If a candidate has no reliably resolvable IMDb id:
     - do NOT invent one
     - do NOT use a Kitsu id as the identity
     - do NOT record it as a taste rejection
     - log it as unresolved_identity / no_imdb and SKIP it this run
   It may become available later; that is not a judgement about the title.

   A Kitsu id may optionally be recorded as external_ids.kitsu. That field
   is INERT: it affects no identity, no dedupe, no routing, no poster, no
   score, no catalog. It is a note for future work and nothing more.

9. Write a COMPLETE descriptive Content DNA vector using the registry in
   data/taste-profile.json. This profile has 40 weighted dimensions and is
   the most expensive in the system to research. If the workload is too
   high, RESEARCH FEWER TITLES - never lower completeness or thresholds.

   DNA IS DESCRIPTIVE. It says what a title IS, never how much it will be
   liked. 0 means assessed absent; null means genuinely unknown; never use
   null as a shortcut and never inflate dna_confidence.

   Keep these apart - they are separate information:
     - dark_tone (how grim the register is) is NOT horror (how much fear
       is the operating mode) is NOT gore (graphic bodily violence) is
       NOT brutality (cruelty and irreversible consequence). A series can
       be deeply dark with almost no horror or gore.
     - power_progression (the cast grows) is NOT power_escalation (the
       setting's ceiling rises) is NOT training_growth (training shown as
       process) is NOT overpowered_protagonist (the lead simply outclasses
       everyone). A gag-superhero series is low on the first three and
       maximum on the last.
     - visual_quality (craft) is NOT visual_uniqueness (distinctiveness)
       is NOT retro_visual_style (era aesthetic). A landmark film can be
       high on all three.
     - action_density (share of runtime) is NOT action_intensity (force
       when it occurs).

   Evidence rules:
     - action_density needs WHOLE-RUNTIME or SEASON-STRUCTURE evidence -
       episode guides, recaps, reviews describing pacing across the work.
       NEVER a trailer, opening sequence or AMV; those are cut from the
       action that exists and imply density that may not.
     - power_progression and training_growth need story/arc evidence, not
       marketing copy.
     - retro_visual_style is judged from the actual art and presentation -
       linework, colour, cel or digital technique, compositing, design.
       RELEASE YEAR IS NEVER AN INPUT. Do not reject a title for being old.
     - visual_uniqueness is distinctiveness, judged separately from craft.

10. dna_tags may contain ONLY values from the tag_registry. Read it.

11. SOURCE PROVENANCE IS MANDATORY AND IS NOT AN EVIDENCE SUMMARY.

    reason = the short human-readable card text.
    source = the ACTUAL MATERIAL your research rested on, as URLs.

    validate.mjs rejects any item whose source has no usable http(s) URL.
    A REPEATED CITATION IS NOT A SECOND SOURCE. Any requested count means
    DISTINCT documents. Citing the same URL twice never satisfies it, and
    validate.mjs rejects it outright. Watch for lookups that silently
    redirect: an episode-list search that lands back on the main article has
    given you ONE source, not two - that exact failure shipped once already.

    Aim for THREE OR MORE DISTINCT: identity/basic metadata, a substantive
    plot/episode/structure source, and a substantive review or reference
    supporting tone, progression, action or art. Anime-specific references
    such as AniList, MyAnimeList, Kitsu, Anime News Network or reputable
    episode guides are all appropriate. Cinemeta and a plot summary alone
    are NOT automatically sufficient for every load-bearing dimension.

12. STOP RESEARCHING at the daily caps or roughly half the working window.
    Counts are not a goal. Fewer validated discoveries beats a timeout,
    and reducing scope must never weaken a threshold, a guardrail or DNA
    quality.

=====================================================================
PHASE C - ACCEPT, VALIDATE, COMMIT (reserve time)
=====================================================================

13. Score and accept only at or above minimum_match_score. match_score IS
    the computed dna-match row score - never invent a second number.

14. THIS PROFILE HAS NO HARD EXCLUSIONS. Nothing is structurally banned.
    Negative contexts - sports, mecha-with-military, romance-led drama,
    cute slice-of-life, weak undistinctive art, straight cape framing -
    are handled by weights and contextual combination penalties, and a
    strong enough title can still clear the bar despite one.

    Never introduce a horror, gore, brutality or dark-tone exclusion.
    Those are the properties this profile is FOR.

15. Write accepted titles to a NEW APPEND-ONLY
    data/discoveries/<UTC-date>-<suffix>.json. Never edit or delete an
    existing discovery file.

16. Append a run record to data/discovery-log.json with searched,
    accepted, rejected and duplicate counts, and list any
    unresolved_identity / no_imdb skips separately from taste rejections.

17. PERFORM A FRESH FINAL DUPLICATE CHECK immediately before writing.

18. CHECK PROVENANCE before the write: every accepted item needs a source
    with real URLs. Drop anything that fails rather than inventing one.

19. VALIDATE by running:  node scripts/validate.mjs
    It must pass. Fix the DATA on failure - never weaken the validator,
    never edit a vendored file in scripts/, never commit past a failure.

20. COMMIT ONCE, TRANSACTIONALLY: discovery file and log together.

21. REPORT accepted / rejected / duplicate / unresolved-identity counts.

A ZERO-FINDING RUN IS VALID. Commit nothing, log the run, say so.

=====================================================================
NEVER ACCEPTABLE
=====================================================================

- treating a baseline anchor as watched
- marking anything watched without an explicit watched_confirmation
- inventing or guessing an IMDb id
- using a Kitsu id as a public identity
- publishing a title with no resolvable IMDb id
- penalising or excluding horror, gore, brutality or dark tone
- importing another profile's horror aversion
- inferring action_density from a trailer, OP or AMV
- using release year as evidence for retro_visual_style
- copying another profile's thresholds
- editing any file in scripts/
- writing to another repository or to private feedback
- creating personalized-scores.json while personalization is off
- committing without a passing validate
```

---

## Future integration boundary

Personalization is **off** by design. When the cross-profile feedback model is frozen, the change here will be additive and narrow: a read-only PHASE A step against the shared private feedback repository, an **ownership filter** (an event is consumable only if its `imdb_id` is already in *this* repository's public identity set), projection through *this* profile's registry only — never another profile's tone aspects — and regeneration of `data/personalized-scores.json` on every successful run.

Full Kitsu identity support (dual-ID resolution, routing, posters) remains a separate phase after all five addons are live.
