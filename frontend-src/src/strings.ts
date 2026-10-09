// UI strings in English and Dutch. Where Home Assistant has a string with the
// same meaning, the text copies it. docs/frontend-strings.md maps every key to
// its home-assistant/frontend translation key for a later port.

const en = {
  card_name: "Automation Pause and Resume",
  card_description:
    "Lists all automations. Pause one for a set time; it turns on again by itself.",

  search_one: "Search {number} automation",
  search_other: "Search {number} automations",
  clear_search: "Clear",
  filters: "Filters",
  filter_all: "All",
  filter_enabled: "Enabled",
  filter_disabled: "Disabled",
  filter_paused: "Paused",
  sort_by: "Sort by {column}",

  column_icon: "Icon",
  column_name: "Name",
  column_area: "Area",
  column_last_triggered: "Last triggered",
  column_state: "State",
  column_actions: "Actions",

  never: "Never",
  disabled: "Disabled",
  unavailable: "Unavailable",
  enable_disable: "Enable/disable",
  resumes: "Resumes {time}",
  resuming: "Resuming…",
  paused_until: "Paused until {time}.",

  overflow_menu: "Overflow menu",
  menu_info: "More info",
  menu_settings: "Settings",
  menu_run: "Run actions",
  menu_trace: "Traces",
  menu_edit: "Edit automation",
  menu_enable: "Enable",
  menu_disable: "Disable",
  menu_pause: "Pause…",
  menu_extend: "Extend…",
  menu_resume: "Resume now",

  block_short_no_id: "No id",
  block_short_already_off: "Already off",
  block_short_unavailable: "Unavailable",
  block_no_id:
    "This automation has no id. Add an id: to it in YAML. Without an id, a restart or reload turns the automation on again, so a pause cannot hold.",
  block_already_off:
    "This automation is already off. Only an automation that is on can be paused.",
  block_unavailable: "This automation is unavailable.",

  dialog_pause_title: "Pause automation",
  dialog_extend_title: "Extend pause",
  dialog_durations: "Duration",
  extend_hint: "The new duration starts now and replaces the current end time.",
  custom: "Custom",
  custom_value: "Value",
  custom_unit: "Unit",
  unit_minutes: "Minutes",
  unit_hours: "Hours",
  unit_days: "Days",
  duration_invalid: "Enter a number.",
  duration_too_short: "A pause must be at least 1 minute.",
  duration_too_long: "A pause can be at most 365 days.",
  cancel: "Cancel",
  close: "Close",
  pause: "Pause",
  extend: "Extend",
  resume_now: "Resume now",

  no_automations: "We couldn't find any automations",
  no_match: "No rows matching current filters",
  entity_not_found: "Entity not available: {entity}",
  error_unknown: "Unknown error",

  // Texts for the ServiceValidationError keys of the backend (strings.json).
  error_not_loaded: "Automation Pause and Resume is not loaded.",
  error_no_entities: "Select at least one automation.",
  error_not_automation: "{entity_id} is not an automation.",
  error_not_found: "{entity_id} does not exist.",
  error_unavailable: "{entity_id} is unavailable.",
  error_no_id:
    "{entity_id} has no id. Add an id: to this automation in YAML. Without it, a restart or reload turns the automation on again.",
  error_already_off: "{entity_id} is already off. There is nothing to pause.",
  error_not_paused: "{entity_id} is not paused.",
  error_duration_too_short: "A pause must be at least 1 minute.",
  error_duration_too_long: "A pause can be at most 365 days.",
};

export type Strings = typeof en;
export type StringKey = keyof Strings;

const nl: Strings = {
  card_name: "Automation Pause and Resume",
  card_description:
    "Toont alle automatiseringen. Pauzeer er een voor een bepaalde tijd; daarna gaat ze vanzelf weer aan.",

  search_one: "Zoek {number} automatisering",
  search_other: "Zoek {number} automatiseringen",
  clear_search: "Wissen",
  filters: "Filters",
  filter_all: "Alle",
  filter_enabled: "Ingeschakeld",
  filter_disabled: "Uitgeschakeld",
  filter_paused: "Gepauzeerd",
  sort_by: "Sorteer op {column}",

  column_icon: "Pictogram",
  column_name: "Naam",
  column_area: "Ruimte",
  column_last_triggered: "Laatst geactiveerd",
  column_state: "Status",
  column_actions: "Acties",

  never: "Nooit",
  disabled: "Uitgeschakeld",
  unavailable: "Niet beschikbaar",
  enable_disable: "In-/uitschakelen",
  resumes: "Hervat {time}",
  resuming: "Wordt hervat…",
  paused_until: "Gepauzeerd tot {time}.",

  overflow_menu: "Overloopmenu",
  menu_info: "Meer info",
  menu_settings: "Instellingen",
  menu_run: "Acties uitvoeren",
  menu_trace: "Traces",
  menu_edit: "Automatisering bewerken",
  menu_enable: "Inschakelen",
  menu_disable: "Uitschakelen",
  menu_pause: "Pauzeren…",
  menu_extend: "Verlengen…",
  menu_resume: "Nu hervatten",

  block_short_no_id: "Geen id",
  block_short_already_off: "Staat al uit",
  block_short_unavailable: "Niet beschikbaar",
  block_no_id:
    "Deze automatisering heeft geen id. Voeg er een id: aan toe in YAML. Zonder id schakelt een herstart of herlading de automatisering weer in, dus een pauze houdt geen stand.",
  block_already_off:
    "Deze automatisering staat al uit. Alleen een automatisering die aan staat, kan gepauzeerd worden.",
  block_unavailable: "Deze automatisering is niet beschikbaar.",

  dialog_pause_title: "Automatisering pauzeren",
  dialog_extend_title: "Pauze verlengen",
  dialog_durations: "Duur",
  extend_hint: "De nieuwe duur start nu en vervangt de huidige eindtijd.",
  custom: "Aangepast",
  custom_value: "Waarde",
  custom_unit: "Eenheid",
  unit_minutes: "Minuten",
  unit_hours: "Uren",
  unit_days: "Dagen",
  duration_invalid: "Geef een getal in.",
  duration_too_short: "Een pauze duurt minstens 1 minuut.",
  duration_too_long: "Een pauze duurt hoogstens 365 dagen.",
  cancel: "Annuleren",
  close: "Sluiten",
  pause: "Pauzeren",
  extend: "Verlengen",
  resume_now: "Nu hervatten",

  no_automations: "We konden geen automatiseringen vinden",
  no_match: "Geen rijen die overeenkomen met de huidige filters",
  entity_not_found: "Entiteit niet beschikbaar: {entity}",
  error_unknown: "Onbekende fout",

  error_not_loaded: "Automation Pause and Resume is niet geladen.",
  error_no_entities: "Kies minstens één automatisering.",
  error_not_automation: "{entity_id} is geen automatisering.",
  error_not_found: "{entity_id} bestaat niet.",
  error_unavailable: "{entity_id} is niet beschikbaar.",
  error_no_id:
    "{entity_id} heeft geen id. Voeg een id: toe aan deze automatisering in YAML. Zonder id schakelt een herstart of herlading de automatisering weer in.",
  error_already_off: "{entity_id} staat al uit. Er is niets te pauzeren.",
  error_not_paused: "{entity_id} is niet gepauzeerd.",
  error_duration_too_short: "Een pauze duurt minstens 1 minuut.",
  error_duration_too_long: "Een pauze duurt hoogstens 365 dagen.",
};

const STRINGS: Record<string, Strings> = { en, nl };

/** The strings for a HA language code such as "nl" or "en-GB". English is the fallback. */
export const getStrings = (language: string | undefined): Strings => {
  const base = (language ?? "en").toLowerCase().split(/[-_]/)[0];
  return STRINGS[base] ?? en;
};

/** Replaces "{name}" placeholders. Unknown placeholders stay as they are. */
export const formatString = (
  template: string,
  values: Record<string, string | number> = {}
): string =>
  template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in values ? String(values[name]) : match
  );
