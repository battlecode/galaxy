import type React from "react";
import type { ScrimmageRecord, TeamPublic } from "api/_autogen";
import { ScrimmageTypeEnum } from "api/apiTypes";
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

  const recordWatcher = queryClient.getQueryState<ScrimmageRecord>(
    buildKey(scrimmagingRecordFactory.queryKey, {
      episodeId,
      teamId: team.id,
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
              scrimmageType={ScrimmageTypeEnum.ALL}
              teamId={team.id}
            />
          )}
          {!hideUnranked && (
            <WinLossTie
              scrimmageType={ScrimmageTypeEnum.UNRANKED}
              teamId={team.id}
            />
          )}
          {!hideRanked && (
            <WinLossTie
              scrimmageType={ScrimmageTypeEnum.RANKED}
              teamId={team.id}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ScrimmagingRecord;
