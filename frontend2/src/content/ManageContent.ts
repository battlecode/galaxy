import type {
  DebuggingTipsPageKey,
  TourneyPageKey,
  QuickStartPageKey,
  ResourcesPageKey,
  CommonIssuesPageKey,
  PageKey,
} from "./ContentStruct";

import * as BC24 from "./bc24";
import * as BC23 from "./bc23";
import * as BC22 from "./bc22";
import * as BC24TEST from "./bc24test";

const bcVersions: Record<
  string,
  typeof BC24 | typeof BC23 | typeof BC22 | typeof BC24TEST
> = {
  bc24: BC24,
  bc23: BC23,
  bc22: BC22,
  bc24test: BC24TEST,
};

function createTextRecord<K extends PageKey>(
  key: string,
): Record<string, Partial<Record<K, string>>> {
  return Object.fromEntries(
    Object.entries(bcVersions).map(([version, content]) => [
      version,
      content[key as keyof typeof content] as Partial<Record<K, string>>,
    ]),
  ) as Record<string, Partial<Record<K, string>>>;
}

export const quickStartText = createTextRecord<QuickStartPageKey>("QUICKSTART");
export const resourcesText = createTextRecord<ResourcesPageKey>("RESOURCES");
export const tournamentsText = createTextRecord<TourneyPageKey>("TOURNAMENTS");
export const debuggingTipsText =
  createTextRecord<DebuggingTipsPageKey>("DEBUGGINGTIPS");
export const commonIssuesText =
  createTextRecord<CommonIssuesPageKey>("COMMONISSUES");
