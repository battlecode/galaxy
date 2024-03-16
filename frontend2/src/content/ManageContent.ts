import {
  BC24_QUICKSTART,
  BC24_RESOURCES,
  BC24_TOURNAMENTS,
  BC24_DEBUGGINGTIPS,
  BC24_COMMONISSUES,
} from "./bc24";
import { BC23_QUICKSTART, BC23_RESOURCES, BC23_TOURNAMENTS } from "./bc23";
import { BC22_QUICKSTART, BC22_RESOURCES, BC22_TOURNAMENTS } from "./bc22";
import type { TourneyPageKey } from "./ContentStruct";
export const defaultQuickStartText = BC23_QUICKSTART;
export const quickStartText: Record<string, string> = {
  bc24: BC24_QUICKSTART,
  bc23: BC23_QUICKSTART,
  bc22: BC22_QUICKSTART,
};

export const defaultResourcesText = BC24_RESOURCES;
export const resourcesText: Record<string, string> = {
  bc24: BC24_RESOURCES,
  bc23: BC23_RESOURCES,
  bc22: BC22_RESOURCES,
};

export const defaultTournamentsText = BC24_TOURNAMENTS;
export const tournamentsText: Record<string, Record<TourneyPageKey, string>> = {
  bc24: BC24_TOURNAMENTS,
  bc23: BC23_TOURNAMENTS,
  bc22: BC22_TOURNAMENTS,
};

export const defaultDebuggingTipsText = BC24_DEBUGGINGTIPS;
export const debuggingTipsText: Record<string, string> = {
  bc24: BC24_DEBUGGINGTIPS,
};

export const defaultCommonIssuesText = BC24_COMMONISSUES;
export const commonIssuesText: Record<string, string> = {
  bc24: BC24_COMMONISSUES,
};
