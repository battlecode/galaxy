import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { useEpisodeId } from "../contexts/EpisodeContext";
import { buildKey } from "../api/helpers";
import { nextTournamentFactory } from "../api/episode/episodeFactories";

interface CountdownDigitalProps {
  date: Date;
  title?: string;
}

const CountdownDigital: React.FC<CountdownDigitalProps> = ({
  date,
  title = "",
}) => {
  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();
  const dateHasPassed = date.getTime() < new Date().getTime();

  const days = Math.floor(
    (date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
  );
  const hours = Math.floor(
    ((date.getTime() - new Date().getTime()) % (1000 * 60 * 60 * 24)) /
      (1000 * 60 * 60),
  );
  const minutes = Math.floor(
    ((date.getTime() - new Date().getTime()) % (1000 * 60 * 60)) / (1000 * 60),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      void queryClient.refetchQueries({
        queryKey: buildKey(nextTournamentFactory.queryKey, { episodeId }),
      });
    }, 1000 * 30);
    return () => {
      clearInterval(interval);
    };
  }, []);

  if (dateHasPassed) return <div>TODO all zeros</div>;
  return (
    <div className="flex max-w-max flex-col gap-1">
      <span className="text-2xl font-bold">{title}</span>
      <div className="grid grid-cols-11 grid-rows-2 content-center justify-center gap-2">
        <div className="col-span-3 self-end text-4xl font-bold">{days}</div>
        <div className="text-4xl font-bold">:</div>
        <div className="col-span-3 self-end text-4xl font-bold">{hours}</div>
        <div className="text-4xl font-bold">:</div>
        <div className="col-span-3 self-end text-4xl font-bold">{minutes}</div>
        <div className="col-span-3 self-start">Days</div>
        <div />
        <div className="col-span-3 self-start">Hours</div>
        <div />
        <div className="col-span-3 self-start">Minutes</div>
      </div>
    </div>
  );
};

export default CountdownDigital;
