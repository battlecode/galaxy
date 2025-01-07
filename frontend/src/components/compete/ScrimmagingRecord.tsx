import type React from "react";
// import { useMemo } from "react";
import type { ScrimmageRecord, TeamPublic } from "api/_autogen";
// import {
//   // CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum,
//   type ScrimmageRecord,
//   type TeamPublic,
// } from "api/_autogen";
import WinLossTie from "./WinLossTie";
import { useEpisodeId } from "contexts/EpisodeContext";
import { useQueryClient } from "@tanstack/react-query";
import { scrimmagingRecordFactory } from "api/compete/competeFactories";
import { buildKey } from "api/helpers";
import { isNil } from "lodash";

interface ScrimmagingRecordProps {
  team: Pick<TeamPublic, "id" | "name" | "profile">;
  hideTeamName?: boolean;
  hideAllScrimmages?: boolean;
  hideUnranked?: boolean;
  hideRanked?: boolean;
  className?: string;
}

const ScrimmagingRecord: React.FC<ScrimmagingRecordProps> = ({
  team,
  hideTeamName = false,
  hideAllScrimmages = false,
  hideUnranked = false,
  hideRanked = false,
  className = "",
}) => {
  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();

  // const scrimTypeToCheck = useMemo(() => {
  //   if (!isNil(hideAllScrimmages) && !hideAllScrimmages) {
  //     return CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum.All;
  //   } else if (!isNil(hideRanked) && !hideRanked) {
  //     return CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum.Ranked;
  //   } else if (!isNil(hideUnranked) && !hideUnranked) {
  //     return CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum.Unranked;
  //   } else {
  //     return CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum.All;
  //   }
  // }, [hideAllScrimmages, hideRanked, hideUnranked]);
  // const scrimTypeToCheck = useMemo(() => {
  //   if (!isNil(hideAllScrimmages) && !hideAllScrimmages) {
  //     return "all";
  //   } else if (!isNil(hideRanked) && !hideRanked) {
  //     return "ranked";
  //   } else if (!isNil(hideUnranked) && !hideUnranked) {
  //     return "unranked";
  //   } else {
  //     return "all";
  //   }
  // }, [hideAllScrimmages, hideRanked, hideUnranked]);

  const recordWatcher = queryClient.getQueryState<ScrimmageRecord>(
    buildKey(scrimmagingRecordFactory.queryKey, {
      episodeId,
      teamId: team.id,
      // scrimmageType: scrimTypeToCheck,
    }),
  );

  return (
    <div
      className={`flex h-full w-full flex-col items-start gap-1 ${className}`}
    >
      {!hideTeamName && (
        <div className="flex flex-1 flex-row items-center justify-start gap-4">
          <img
            className="h-20 w-20 rounded-full bg-gray-400 md:h-16 md:w-16"
            src={team.profile?.avatar_url ?? "/default_profile_picture.png"}
          />
          <div className="text-xl font-semibold">{team.name}</div>
        </div>
      )}
      {!isNil(recordWatcher) && !isNil(recordWatcher.error) ? (
        <div className="mb-2 mt-4 flex w-full flex-row items-center justify-center gap-3 text-gray-400">
          Error fetching scrimmaging record.
        </div>
      ) : (
        <div className="flex w-full flex-col items-center justify-center gap-3">
          {!hideAllScrimmages && (
            <WinLossTie
              // scrimmageType={
              //   CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum.All
              // }
              scrimmageType="All"
              teamId={team.id}
            />
          )}
          {!hideUnranked && (
            <WinLossTie
              // scrimmageType={
              //   CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum.Unranked
              // }
              scrimmageType="Ranked"
              teamId={team.id}
            />
          )}
          {!hideRanked && (
            <WinLossTie
              // scrimmageType={
              //   CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum.Ranked
              // }
              scrimmageType="Unranked"
              teamId={team.id}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ScrimmagingRecord;
