import type {
  DebuggingTipsPageKey,
  TourneyPageKey,
  QuickStartPageKey,
  ResourcesPageKey,
  CommonIssuesPageKey,
} from "./ContentStruct";

import {
  BC24_QUICKSTART,
  BC24_RESOURCES,
  BC24_TOURNAMENTS,
  BC24_DEBUGGINGTIPS,
  BC24_COMMONISSUES,
} from "./bc24";
import { BC23_TOURNAMENTS } from "./bc23";
import { BC22_TOURNAMENTS } from "./bc22";

export const defaultQuickStartText = BC24_QUICKSTART;
export const quickStartText: Record<
  string,
  Partial<Record<QuickStartPageKey, string>>
> = {
  bc24: BC24_QUICKSTART,
};

export const defaultResourcesText = BC24_RESOURCES;
export const resourcesText: Record<
  string,
  Partial<Record<ResourcesPageKey, string>>
> = {
  bc24: BC24_RESOURCES,
};

export const defaultTournamentsText = BC24_TOURNAMENTS;
export const tournamentsText: Record<
  string,
  Partial<Record<TourneyPageKey, string>>
> = {
  bc24: BC24_TOURNAMENTS,
  bc23: BC23_TOURNAMENTS,
  bc22: BC22_TOURNAMENTS,
};

export const defaultDebuggingTipsText = BC24_DEBUGGINGTIPS;
export const debuggingTipsText: Record<
  string,
  Partial<Record<DebuggingTipsPageKey, string>>
> = {
  bc24: BC24_DEBUGGINGTIPS,
};

export const defaultCommonIssuesText = BC24_COMMONISSUES;
export const commonIssuesText: Record<
  string,
  Partial<Record<CommonIssuesPageKey, string>>
> = {
  bc24: BC24_COMMONISSUES,
};
