export const REACTION_TYPES = ["cry", "laugh", "shock", "hype", "angry"] as const;
export type ReactionType = (typeof REACTION_TYPES)[number];
