import React, { useMemo } from "react";
import { CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum } from "api/_autogen";
import Spinner from "components/Spinner";
import { isNil } from "lodash";

interface WinLossTieProps {
  scrimmageType: CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum;
  wins: number;
  losses: number;
  ties: number;
  loading?: boolean;
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
  wins,
  losses,
  ties,
  loading,
  className = "",
}) => {
  const HEADER =
    "w-full border-t-2 border-b-2 border-solid border-cyan-600 text-center";

  const dataClassName = useMemo(() => {
    const baseClassName = "w-full p-1";
    if (!isNil(loading) && loading) {
      return `${baseClassName} flex flex-row items-center justify-center`;
    } else {
      return `${baseClassName} text-center font-semibold`;
    }
  }, [loading]);

  const dataOrLoading = (count: number): JSX.Element => {
    if (!isNil(loading) && loading) {
      return <Spinner size="sm" />;
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
        {dataOrLoading(wins)}
      </div>
      <div className={`bg-red-200 ${dataClassName}`}>
        {dataOrLoading(losses)}
      </div>
      <div className={`rounded-br-lg bg-gray-200 ${dataClassName}`}>
        {dataOrLoading(ties)}
      </div>
    </div>
  );
};

export default WinLossTie;
