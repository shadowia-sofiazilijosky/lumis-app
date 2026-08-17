export const ReadingStatus = {
  TBR: "TBR",
  READING: "READING",
  PAUSED: "PAUSED",
  FINISHED: "FINISHED",
  REREAD: "REREAD",
  ABANDONED: "ABANDONED",
} as const;

export type ReadingStatus = (typeof ReadingStatus)[keyof typeof ReadingStatus];
