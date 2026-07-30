export const LABS_AUDIENCES = [
  "daily",
  "family",
  "friends",
  "business",
  "school",
  "mix",
] as const;

export const LABS_TIME_SPENT = [
  "under_2h",
  "2_5h",
  "5_10h",
  "10_plus",
] as const;

export const LABS_EXPECTATIONS = [
  "playbook",
  "drafting",
  "shared_workflow",
  "prioritize",
  "exploring",
] as const;

export type LabsAudienceValue = (typeof LABS_AUDIENCES)[number];
export type LabsTimeSpentValue = (typeof LABS_TIME_SPENT)[number];
export type LabsExpectationValue = (typeof LABS_EXPECTATIONS)[number];
