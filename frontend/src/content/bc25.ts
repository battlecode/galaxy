import type {
  QuickStartPageKey,
  ResourcesPageKey,
  DebuggingTipsPageKey,
  CommonIssuesPageKey,
  TourneyPageKey,
} from "./ContentStruct";

export const QUICKSTART: Partial<Record<QuickStartPageKey, string>> = {};

export const RESOURCES: Partial<Record<ResourcesPageKey, string>> = {};

export const DEBUGGINGTIPS: Partial<Record<DebuggingTipsPageKey, string>> = {};

export const COMMONISSUES: Partial<Record<CommonIssuesPageKey, string>> = {};

export const TOURNAMENTS: Partial<Record<TourneyPageKey, string>> = {};
