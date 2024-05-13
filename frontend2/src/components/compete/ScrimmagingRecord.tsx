import React from "react";
import {
  CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum,
  type TeamPublic,
} from "api/_autogen";
import { useScrimmagingRecord } from "api/compete/useCompete";
import { useEpisodeId } from "contexts/EpisodeContext";
import WinLossTie from "./WinLossTie";
import Spinner from "components/Spinner";

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
  const scrimmagingRecordAll = useScrimmagingRecord({
    episodeId,
    teamId: team.id,
    scrimmageType: CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum.All,
  });
  const scrimmagingRecordUnranked = useScrimmagingRecord({
    episodeId,
    teamId: team.id,
    scrimmageType:
      CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum.Unranked,
  });
  const scrimmagingRecordRanked = useScrimmagingRecord({
    episodeId,
    teamId: team.id,
    scrimmageType:
      CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum.Ranked,
  });

  return (
    <div
      className={`flex h-full w-full flex-col items-start gap-1 ${className}`}
    >
      {!hideTeamName && (
        <div className="flex flex-1 flex-row items-center justify-start gap-4">
          <img
            className="h-20 w-20 rounded-full bg-gray-400 md:h-16 md:w-16"
            src={team.profile?.avatar_url}
          />
          <div className="text-xl font-semibold">{team.name}</div>
        </div>
      )}
      {!scrimmagingRecordAll.isSuccess ||
      !scrimmagingRecordUnranked.isSuccess ||
      !scrimmagingRecordRanked.isSuccess ? (
        <div className="mb-2 mt-4 flex w-full flex-row items-center justify-center gap-3 text-gray-400">
          Loading... <Spinner size="lg" />
        </div>
      ) : (
        <div className="flex w-full flex-row items-center justify-center gap-3 md:flex-col">
          {!hideAllScrimmages && (
            <WinLossTie
              scrimmageType={
                CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum.All
              }
              wins={scrimmagingRecordAll.data.wins ?? 0}
              losses={scrimmagingRecordAll.data.losses ?? 0}
              ties={scrimmagingRecordAll.data.ties ?? 0}
            />
          )}
          {!hideUnranked && (
            <WinLossTie
              scrimmageType={
                CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum.Unranked
              }
              wins={scrimmagingRecordUnranked.data.wins ?? 0}
              losses={scrimmagingRecordUnranked.data.losses ?? 0}
              ties={scrimmagingRecordUnranked.data.ties ?? 0}
            />
          )}
          {!hideRanked && (
            <WinLossTie
              scrimmageType={
                CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum.Ranked
              }
              wins={scrimmagingRecordRanked.data.wins ?? 0}
              losses={scrimmagingRecordRanked.data.losses ?? 0}
              ties={scrimmagingRecordRanked.data.ties ?? 0}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ScrimmagingRecord;
