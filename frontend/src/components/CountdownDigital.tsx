import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useMemo, useState } from "react";
import { useEpisodeId } from "../contexts/EpisodeContext";
import { buildKey } from "../api/helpers";
import { nextTournamentFactory } from "../api/episode/episodeFactories";
import {
  HOURS_DAY,
  MILLIS_SECOND,
  MINUTES_HOUR,
  SECONDS_MINUTE,
} from "utils/utilTypes";

interface ProgressCircleProps {
  sqSize: number;
  percentage: number;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({
  sqSize,
  percentage

}) => {
  const strokeWidth = 6;
  const radius = (sqSize - strokeWidth) / 2;
  const viewBox = `0 0 ${sqSize} ${sqSize}`;
  const dashArray = radius * Math.PI * 2;
  const dashOffset = dashArray - (dashArray * percentage) / 100;

  return (
    <svg width={sqSize} height={sqSize} viewBox={viewBox}>
            <circle
            className="fill-none stroke-gray-200"
            cx={sqSize / 2}
            cy={sqSize / 2}
            r={radius}
            strokeWidth={`${strokeWidth*0.5}px`} />
            <circle
              className="fill-none stroke-cyan-600 transition-all delay-200 ease-in"
              cx={sqSize / 2}
              cy={sqSize / 2}
              r={radius}
              strokeLinecap="round"
              strokeWidth={`${strokeWidth}px`}
              transform={`rotate(-90 ${sqSize / 2} ${sqSize / 2})`}
              style={{
                strokeDasharray: dashArray,
                strokeDashoffset: dashOffset,
              }} />
          </svg>
  );
};

interface DateParams {
  days: number,
  hours: number,
  minutes: number
}

const computeTimeDiff = (fromDate: Date, toDate: Date): DateParams => {
  const timeDiff = toDate.getTime() - fromDate.getTime();

  const days = Math.floor(
    (timeDiff) / (1000 * 60 * 60 * 24),
  );
  const hours = Math.floor(
    ((timeDiff) % (1000 * 60 * 60 * 24)) /
      (1000 * 60 * 60),
  );
  const minutes = Math.floor(
    ((timeDiff) % (1000 * 60 * 60)) / (1000 * 60),
  );

  return { days: days, hours: hours, minutes: minutes };
};

interface CountdownDigitalProps {
  date: Date;
  title?: string;
}

const CountdownDigital: React.FC<CountdownDigitalProps> = ({
  date,
}) => {
  const currentTime = new Date();
  const dateHasPassed = date.getTime() < currentTime.getTime();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCount((prevCount) => prevCount + 1);
    }, 1000 * 30);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const countdownInfo = useMemo(() => computeTimeDiff(currentTime, date), [count]);
  const progressCircleSize = 140;
  const percentageDays = ((60-countdownInfo.days)/60)*100;
  const percentageHours = ((24-countdownInfo.hours)/24)*100;
  const percentageMins = ((60-countdownInfo.minutes)/60)*100;
  const countTxtSize = "3xl";
  const labelTxtSize = "l";


  return (
    <div className={`flex flex-row max-w-max justify-evenly gap-8`}>
        <div className="relative">
          {ProgressCircle({sqSize: progressCircleSize, percentage: percentageDays})}

          <div className={`absolute top-${progressCircleSize / 2} left-${progressCircleSize / 2} top-1/2 start-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center`}>
            <span className={`font-bold text-${countTxtSize}`}>{countdownInfo.days}</span>
            <span className={`block text-${labelTxtSize}`}>Days</span>
          </div>
        </div>
        <div className="relative">
          {ProgressCircle({sqSize: progressCircleSize, percentage: percentageHours})}

          <div className={`absolute top-${progressCircleSize / 2} left-${progressCircleSize / 2} top-1/2 start-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center`}>
            <span className={`font-bold text-${countTxtSize}`}>{countdownInfo.hours}</span>
            <span className={`block text-${labelTxtSize}`}>Hours</span>
          </div>
        </div>
        <div className="relative">
          {ProgressCircle({sqSize: progressCircleSize, percentage: percentageMins})}

          <div className={`absolute top-${progressCircleSize / 2} left-${progressCircleSize / 2} top-1/2 start-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center`}>
            <span className={`font-bold text-${countTxtSize}`}>{countdownInfo.minutes}</span>
            <span className={`block text-${labelTxtSize}`}>Mins</span>
          </div>
        </div>
      </div>
  );
};

export default CountdownDigital;
