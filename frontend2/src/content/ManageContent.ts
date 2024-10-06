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

import {
  BC24TEST_QUICKSTART,
  BC24TEST_RESOURCES,
  BC24TEST_TOURNAMENTS,
  BC24TEST_DEBUGGINGTIPS,
  BC24TEST_COMMONISSUES,
} from "./bc24test";


import {
  BC23_QUICKSTART,
  BC23_RESOURCES,
  BC23_TOURNAMENTS,
  BC23_DEBUGGINGTIPS,
  BC23_COMMONISSUES,
} from "./bc23";

import {
  BC22_QUICKSTART,
  BC22_RESOURCES,
  BC22_TOURNAMENTS,
  BC22_DEBUGGINGTIPS,
  BC22_COMMONISSUES,
} from "./bc22";


export const quickStartText: Record<
  string,
  Partial<Record<QuickStartPageKey, string>>
> = {
  bc24: BC24_QUICKSTART,
  bc24test: BC24TEST_QUICKSTART,
  bc23: BC23_QUICKSTART,
  bc22: BC22_QUICKSTART,
};

export const resourcesText: Record<
  string,
  Partial<Record<ResourcesPageKey, string>>
> = {
  bc24: BC24_RESOURCES,
  bc24test: BC24TEST_RESOURCES,
  bc23: BC23_RESOURCES,
  bc22: BC22_RESOURCES,
};

export const tournamentsText: Record<
  string,
  Partial<Record<TourneyPageKey, string>>
> = {
  bc24: BC24_TOURNAMENTS,
  bc24test: BC24TEST_TOURNAMENTS,
  bc23: BC23_TOURNAMENTS,
  bc22: BC22_TOURNAMENTS,
};

export const debuggingTipsText: Record<
  string,
  Partial<Record<DebuggingTipsPageKey, string>>
> = {
  bc24: BC24_DEBUGGINGTIPS,
  bc24test: BC24TEST_DEBUGGINGTIPS,
  bc23: BC23_DEBUGGINGTIPS,
  bc22: BC22_DEBUGGINGTIPS,
};

export const commonIssuesText: Record<
  string,
  Partial<Record<CommonIssuesPageKey, string>>
> = {
  bc24: BC24_COMMONISSUES,
  bc24test: BC24TEST_COMMONISSUES,
  bc23: BC23_COMMONISSUES,
  bc22: BC22_COMMONISSUES,
};