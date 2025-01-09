import type React from "react";
import { useEffect, useMemo, useState } from "react";

const thousand = 1000;
const sixty = 60;
const hoursInDay = 24;
const fullPercentage = 100;
const countDownRefreshRate = 30;

interface ProgressCircleProps {
  sqSize: number;
  percentage: number;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({
  sqSize,
  percentage,
}) => {
  const strokeWidth = 6;
  const radius = (sqSize - strokeWidth) / 2;
  const viewBox = `0 0 ${sqSize} ${sqSize}`;
  const dashArray = radius * Math.PI * 2;
  const dashOffset = dashArray - (dashArray * percentage) / fullPercentage;

  return (
    <svg width={sqSize} height={sqSize} viewBox={viewBox}>
      <circle
        className="fill-none stroke-gray-200"
        cx={sqSize / 2}
        cy={sqSize / 2}
        r={radius}
        strokeWidth={`${strokeWidth / 2}px`}
      />
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
        }}
      />
    </svg>
  );
};

interface DateParams {
  days: number;
  hours: number;
  minutes: number;
}

const computeTimeDiff = (fromDate: Date, toDate: Date): DateParams => {
  const timeDiff = toDate.getTime() - fromDate.getTime();

  const days = Math.floor(timeDiff / (thousand * sixty * sixty * hoursInDay));
  const hours = Math.floor(
    (timeDiff % (thousand * sixty * sixty * hoursInDay)) /
      (thousand * sixty * sixty),
  );
  const minutes = Math.floor(
    (timeDiff % (thousand * sixty * sixty)) / (thousand * sixty),
  );

  return { days, hours, minutes };
};

interface CountdownDigitalProps {
  date: Date;
  title?: string;
}

const CountdownDigital: React.FC<CountdownDigitalProps> = ({ date }) => {
  const currentTime = new Date();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCount((prevCount) => prevCount + 1);
    }, thousand * countDownRefreshRate);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const countdownInfo = useMemo(
    () => computeTimeDiff(currentTime, date),
    [count],
  );
  const progressCircleSize = 140;
  const percentageDays =
    ((sixty - countdownInfo.days) / sixty) * fullPercentage;
  const percentageHours =
    ((hoursInDay - countdownInfo.hours) / hoursInDay) * fullPercentage;
  const percentageMins =
    ((sixty - countdownInfo.minutes) / sixty) * fullPercentage;
  const countTxtSize = "3xl";
  const labelTxtSize = "l";

  return (
    <div className={`flex max-w-max flex-row justify-evenly gap-8`}>
      <div className="relative">
        {ProgressCircle({
          sqSize: progressCircleSize,
          percentage: percentageDays,
        })}

        <div
          className={`absolute top-${progressCircleSize / 2} left-${
            progressCircleSize / 2
          } start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform text-center`}
        >
          <span className={`font-bold text-${countTxtSize}`}>
            {countdownInfo.days}
          </span>
          <span className={`block text-${labelTxtSize}`}>Days</span>
        </div>
      </div>
      <div className="relative">
        {ProgressCircle({
          sqSize: progressCircleSize,
          percentage: percentageHours,
        })}

        <div
          className={`absolute top-${progressCircleSize / 2} left-${
            progressCircleSize / 2
          } start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform text-center`}
        >
          <span className={`font-bold text-${countTxtSize}`}>
            {countdownInfo.hours}
          </span>
          <span className={`block text-${labelTxtSize}`}>Hours</span>
        </div>
      </div>
      <div className="relative">
        {ProgressCircle({
          sqSize: progressCircleSize,
          percentage: percentageMins,
        })}

        <div
          className={`absolute top-${progressCircleSize / 2} left-${
            progressCircleSize / 2
          } start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform text-center`}
        >
          <span className={`font-bold text-${countTxtSize}`}>
            {countdownInfo.minutes}
          </span>
          <span className={`block text-${labelTxtSize}`}>Mins</span>
        </div>
      </div>
    </div>
  );
};

export default CountdownDigital;
