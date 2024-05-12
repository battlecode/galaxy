import type React from "react";
import { useMemo } from "react";
import { useEpisodeId } from "../contexts/EpisodeContext";
import { useEpisodeInfo, useNextTournament } from "../api/episode/useEpisode";
import SectionCard from "../components/SectionCard";
import CountdownDigital from "../components/CountdownDigital";
import { SocialIcon } from "react-social-icons";
import TeamChart, {
  type ChartData,
} from "../components/tables/chart/TeamChart";
import EpisodeChart from "../components/tables/chart/EpisodeChart";
import { useQueryClient } from "@tanstack/react-query";
import {
  useTopRatingHistoryList,
  useRatingHistoryList,
} from "api/compete/useCompete";
import ScrimmagingRecord from "components/compete/ScrimmagingRecord";
import { useUserTeam } from "api/team/useTeam";
import { isPresent } from "utils/utilTypes";

const Home: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const episode = useEpisodeInfo({ id: episodeId });
  const nextTournament = useNextTournament({ episodeId });
  const topRatingHistory = useTopRatingHistoryList({ episodeId, n: 10 });
  const userTeam = useUserTeam({ episodeId });
  const userTeamRatingHistory = useRatingHistoryList({
    episodeId,
    teamId: undefined,
  });

  const SOCIAL =
    "hover:drop-shadow-lg hover:opacity-80 transition-opacity duration-300 ease-in-out";

/*
  const ratingData: Record<string, ChartData[]> | undefined = useMemo(() => {
    if (!topRatingHistory.isSuccess) return undefined;
    const ratingRecord: Record<string, ChartData[]> = {};
    return topRatingHistory.data.reduce((record, teamData) => {
      if (teamData.team_rating !== undefined) {
        record[teamData.team_rating.team.name] =
          teamData.team_rating.rating_history.map((match) => [
            match.timestamp.getTime(),
            match.rating,
          ]);
      }
      return record;
    }, ratingRecord);
  }, [topRatingHistory]);
*/

  return (
    <div className="p-6">
      <div className="flex flex-col gap-6 xl:flex-row">
        <div className="flex w-full flex-col gap-6 xl:w-1/2">
          <SectionCard
            title={
              episode.isSuccess
                ? `Welcome to ${episode.data.name_long}!`
                : "Welcome!"
            }
            loading={episode.isLoading}
          >
            <span>
              {episode.isSuccess && isPresent(episode.data.blurb)
                ? episode.data.blurb
                : `Welcome!`}
            </span>
          </SectionCard>

          <SectionCard title="Scrimmaging Record" loading={userTeam.isLoading}>
            {userTeam.isSuccess ? (
              <ScrimmagingRecord
                team={userTeam.data}
                hideRanked={true}
                hideUnranked={true}
              />
            ) : (
              "Join a team to scrimmage other teams!"
            )}
          </SectionCard>
          <SectionCard title="Rating History">
            <TeamChart
              yAxisLabel="Rating"
              values={userTeamRatingData}
              loading={userTeamRatingHistory.isLoading}
              loadingMessage="Loading rating history..."
            />
          </SectionCard>
        </div>
        <div className="flex w-full flex-col gap-6 xl:w-1/2">
          <SectionCard
            title="Next Submission Deadline"
            loading={nextTournament.isLoading}
          >
            {nextTournament.isSuccess && nextTournament.data !== null ? (
              <CountdownDigital date={nextTournament.data.submission_freeze} />
            ) : (
              "No upcoming submission deadlines."
            )}
          </SectionCard>
          <SectionCard title="Social Medias">
            <div className="flex w-full flex-row items-center gap-10">
              <SocialIcon
                url="https://www.github.com/battlecode"
                className={SOCIAL}
              />
              <SocialIcon
                url="https://www.youtube.com/@MITBattlecode"
                className={SOCIAL}
              />
              <SocialIcon
                url="https://www.instagram.com/mitbattlecode"
                className={SOCIAL}
              />
              <SocialIcon url="https://discord.gg/N86mxkH" className={SOCIAL} />
            </div>
          </SectionCard>
          <SectionCard title="Top Teams">
            <EpisodeChart/>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default Home;
