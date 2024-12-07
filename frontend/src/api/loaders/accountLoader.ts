import type { QueryClient } from "@tanstack/react-query";
import { CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum } from "api/_autogen";
import { scrimmagingRecordFactory } from "api/compete/competeFactories";
import { safeEnsureQueryData } from "api/helpers";
import type { LoaderFunction } from "react-router-dom";

export const accountLoader =
  (queryClient: QueryClient): LoaderFunction =>
  ({ params }) => {
    const { episodeId } = params;

    if (episodeId === undefined) return null;

    // User team scrimmage record
    safeEnsureQueryData(
      {
        episodeId,
        scrimmageType:
          CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum.All,
      },
      scrimmagingRecordFactory,
      queryClient,
    );

    return null;
  };
