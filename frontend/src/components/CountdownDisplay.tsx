import type React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  HOURS_DAY,
  MILLIS_SECOND,
  MINUTES_HOUR,
  SECONDS_MINUTE,
} from "utils/utilTypes";

const REFRESH_RATE = 30;
const MAX_DAYS_REMAINING = 60;

interface ProgressCircleProps {
  progressPercentage: number;
  labelText: string;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({
  progressPercentage,
  labelText,
}) => {
  const CIRCLE_DEGREES = 360;
  const BORDER_STYLE = "border-4 sm:border-4 md:border-6 lg:border-8";

  return (
    <div className="relative h-24 w-24 sm:h-24 sm:w-24 md:h-32 md:w-32 lg:h-40 lg:w-40">
      {/* Gray background circle */}
      <div
        className={`h-full w-full rounded-full border-gray-200 ${BORDER_STYLE}`}
      />

      {/* Blue progress circle */}
      <div
        className={`absolute left-0 top-0 h-full w-full rounded-full`}
        style={{
          background: `conic-gradient(#0891b2 ${
            (progressPercentage * CIRCLE_DEGREES) / 100
          }deg, transparent 0deg)`,
          mask: "radial-gradient(transparent 60%, black 61%)",
          WebkitMask: "radial-gradient(transparent 60%, black 61%)",
        }}
      />

      {/* Percentage text */}
      <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center">
        <span className="text-center text-sm font-bold sm:text-xs md:text-xl lg:text-2xl">
          {labelText}
        </span>
      </div>
    </div>
  );
};

interface DateParams {
  days: number;
  hours: number;
  minutes: number;
}

const computeTimeDiff = (fromDate: Date, toDate: Date): DateParams => {
  const timeDiff = toDate.getTime() - fromDate.getTime();

  const days = Math.floor(
    timeDiff / (MILLIS_SECOND * SECONDS_MINUTE * MINUTES_HOUR * HOURS_DAY),
  );
  const hours = Math.floor(
    (timeDiff % (MILLIS_SECOND * SECONDS_MINUTE * MINUTES_HOUR * HOURS_DAY)) /
      (MILLIS_SECOND * SECONDS_MINUTE * MINUTES_HOUR),
  );
  const minutes = Math.floor(
    (timeDiff % (MILLIS_SECOND * SECONDS_MINUTE * MINUTES_HOUR)) /
      (MILLIS_SECOND * SECONDS_MINUTE),
  );

  return { days, hours, minutes };
};

interface CountdownDisplayProps {
  date: Date;
  title?: string;
}

const CountdownDisplay: React.FC<CountdownDisplayProps> = ({ date }) => {
  const currentTime = new Date();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCount((prevCount) => prevCount + 1);
    }, MILLIS_SECOND * REFRESH_RATE);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const countdownInfo = useMemo(
    () => computeTimeDiff(currentTime, date),
    [count, date],
  );
  const percentageDays =
    (Math.max(0, MAX_DAYS_REMAINING - countdownInfo.days) /
      MAX_DAYS_REMAINING) *
    100;
  const percentageHours = ((HOURS_DAY - countdownInfo.hours) / HOURS_DAY) * 100;
  const percentageMins =
    ((MINUTES_HOUR - countdownInfo.minutes) / MINUTES_HOUR) * 100;

  return (
    <div className="grid auto-cols-min auto-rows-min grid-cols-3 place-items-center gap-5 md:max-w-[600px]">
      <ProgressCircle
        progressPercentage={percentageDays}
        labelText={`${countdownInfo.days} Days`}
      />
      <ProgressCircle
        progressPercentage={percentageHours}
        labelText={`${countdownInfo.hours} Hours`}
      />
      <ProgressCircle
        progressPercentage={percentageMins}
        labelText={`${countdownInfo.minutes} Mins`}
      />
    </div>
  );
};

export default CountdownDisplay;
