import React, { useMemo } from "react";
import { CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum } from "api/_autogen";
import Spinner from "components/Spinner";
import { isNil } from "lodash";
import { useScrimmagingRecord } from "api/compete/useCompete";
import { useEpisodeId } from "contexts/EpisodeContext";

interface WinLossTieProps {
  scrimmageType: CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum;
  teamId: number;
  className?: string;
}

const scrimmageTypeToName = {
  [CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum.All]:
    "All Scrimmages",
  [CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum.Unranked]: "Unranked",
  [CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum.Ranked]: "Ranked",
} as const;

const WinLossTie: React.FC<WinLossTieProps> = ({
  scrimmageType,
  teamId,
  className = "",
}) => {
  const { episodeId } = useEpisodeId();
  const scrimRecord = useScrimmagingRecord({
    episodeId,
    teamId,
    scrimmageType,
  });

  const HEADER =
    "w-full border-t-2 border-b-2 border-solid border-cyan-600 text-center";

  const dataClassName = useMemo(() => {
    const baseClassName = "w-full p-1";
    if (scrimRecord.isLoading) {
      return `${baseClassName} flex flex-row items-center justify-center`;
    } else {
      return `${baseClassName} text-center font-semibold`;
    }
  }, [scrimRecord.isLoading]);

  const dataOrLoading = (count?: number): JSX.Element => {
    if (scrimRecord.isLoading) {
      return <Spinner size="sm" />;
    } else if (isNil(count)) {
      return <>—</>;
    } else {
      return <>{count}</>;
    }
  };

  return (
    <div
      className={`grid w-full grid-cols-3 justify-stretch justify-items-center ${className}`}
    >
      <div className="col-span-3 text-lg font-semibold">
        {scrimmageTypeToName[scrimmageType]}
      </div>
      <span
        className={`${HEADER} rounded-tl-lg border-b-2 border-l-2 border-r-[1px]`}
      >
        Wins
      </span>
      <span className={`${HEADER} border-l-[1px] border-r-[1px]`}>Losses</span>
      <span className={`${HEADER} rounded-tr-lg border-l-[1px] border-r-2`}>
        Ties
      </span>
      <div className={`rounded-bl-lg bg-green-200 ${dataClassName}`}>
        {dataOrLoading(scrimRecord.data?.wins)}
      </div>
      <div className={`bg-red-200 ${dataClassName}`}>
        {dataOrLoading(scrimRecord.data?.losses)}
      </div>
      <div className={`rounded-br-lg bg-gray-200 ${dataClassName}`}>
        {dataOrLoading(scrimRecord.data?.ties)}
      </div>
    </div>
  );
};

export default WinLossTie;
