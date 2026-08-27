// GENERATED ONCE AT SCAFFOLD TIME - this repo's frozen DNA vocabulary.
//
// This is the one file the generator writes from the profile rather than
// copying verbatim, and it is what lets validate-profile.mjs stay genre-neutral
// and vendored. The guard it feeds is deliberately strict: data/taste-profile.json
// must declare EXACTLY these dimensions and EXACTLY these tags, no more and no
// fewer, so a typo becomes a loud failure instead of quiet new metadata.
//
// Changing this list is a schema decision. It means a registry version bump, a
// migration for every already-enriched record, and a review of every consumer -
// never a casual edit.

export const CANONICAL_DIMENSIONS = [
  "mystery",
  "psychological_strategy",
  "cat_and_mouse",
  "deception",
  "plot_twists",
  "suspense",
  "progressive_revelation",
  "rule_discovery",
  "power_progression",
  "power_escalation",
  "training_growth",
  "ability_variety",
  "power_system_depth",
  "overpowered_protagonist",
  "supernatural",
  "horror",
  "gore",
  "brutality",
  "dark_tone",
  "creature_threat",
  "sci_fi_elements",
  "reality_anomaly",
  "weirdness",
  "strange_world",
  "worldbuilding",
  "magic_presence",
  "adventure",
  "action_density",
  "action_intensity",
  "visual_quality",
  "visual_uniqueness",
  "retro_visual_style",
  "wtf_comedy",
  "comedy",
  "drama_focus",
  "romance_focus",
  "sports_focus",
  "mecha_focus",
  "military_focus",
  "slice_of_life",
  "superhero",
  "pace_speed"
];

export const CANONICAL_DNA_TAGS = [
  "shonen_battle",
  "seinen",
  "isekai",
  "cyberpunk",
  "post_apocalyptic",
  "school_setting",
  "tournament",
  "hunter_guild",
  "demons",
  "curses",
  "titans",
  "time_loop",
  "body_horror",
  "dungeon",
  "pirates",
  "ninja",
  "shinigami",
  "psychic_powers",
  "detective",
  "survival_game"
];

// The single deliberate exception to the shared absent..dominant scale:
// pace_speed measures slow..fast. Exactly one dimension may be slow_to_fast.
export const SLOW_TO_FAST_DIMENSION = "pace_speed";
