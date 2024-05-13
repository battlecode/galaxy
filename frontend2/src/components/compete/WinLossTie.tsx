import React from "react";
import { CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum } from "api/_autogen";

interface WinLossTieProps {
  scrimmageType: CompeteMatchScrimmagingRecordRetrieveScrimmageTypeEnum;
  wins: number;
  losses: number;
  ties: number;
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
  className = "",
}) => {
  return (
    <div
      className={`grid w-full grid-cols-3 justify-stretch justify-items-center ${className}`}
    >
      <div className="col-span-3 text-lg font-semibold">
        {scrimmageTypeToName[scrimmageType]}
      </div>
      <span className="w-full rounded-tl-lg border-b-2 border-l-2 border-r-[1px] border-t-2 border-solid border-cyan-400 text-center">
        Wins
      </span>
      <span className="w-full border-b-2 border-l-[1px] border-r-[1px] border-t-2 border-solid border-cyan-400 text-center">
        Losses
      </span>
      <span className="w-full rounded-tr-lg border-b-2 border-l-[1px] border-r-2 border-t-2 border-solid border-cyan-400 text-center">
        Ties
      </span>
      <div className="w-full rounded-bl-lg bg-green-200 text-center font-semibold">
        {wins}
      </div>
      <div className="w-full bg-red-200 text-center font-semibold">
        {losses}
      </div>
      <div className="w-full rounded-br-lg bg-gray-200 text-center font-semibold">
        {ties}
      </div>
    </div>
  );
};

export default WinLossTie;
