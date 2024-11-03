import React, { useMemo } from "react";
import { useEpisodeId } from "../contexts/EpisodeContext";
import { useEpisodeInfo, useNextTournament } from "../api/episode/useEpisode";
import SectionCard from "../components/SectionCard";
import CountdownDigital from "../components/CountdownDigital";
import Spinner from "../components/Spinner";
import { SocialIcon } from "react-social-icons";
import TeamChart, {
  type ChartData,
} from "../components/tables/chart/TeamChart";
import {
  useTopRatingHistoryList,
  useUserRatingHistoryList,
} from "api/compete/useCompete";
import ScrimmagingRecord from "components/compete/ScrimmagingRecord";
import { useUserTeam } from "api/team/useTeam";

const Home: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const episode = useEpisodeInfo({ id: episodeId });
  const nextTournament = useNextTournament({ episodeId });
  const topRatingHistory = useTopRatingHistoryList({ episodeId });
  const userTeam = useUserTeam({ episodeId });
  const userTeamRatingHistory = useUserRatingHistoryList({ episodeId });

  const SOCIAL =
    "hover:drop-shadow-lg hover:opacity-80 transition-opacity duration-300 ease-in-out";

  const userTeamRatingData: Record<string, ChartData[]> | undefined =
    useMemo(() => {
      if (!userTeamRatingHistory.isSuccess) return undefined;
      const ratingRecord: Record<string, ChartData[]> = {};
      return userTeamRatingHistory.data.reduce((record, teamData) => {
        if (teamData.team_rating !== undefined) {
          record[teamData.team_rating.team.name] =
            teamData.team_rating.rating_history.map((match) => [
              match.timestamp.getTime(),
              match.rating,
            ]);
        }
        return record;
      }, ratingRecord);
    }, [userTeamRatingHistory]);

  const topTeamRatingData: Record<string, ChartData[]> | undefined =
    useMemo(() => {
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

  return (
    <div className="p-6">
      <div className="flex flex-col gap-6 xl:flex-row">
        <div className="flex w-full flex-col gap-6 xl:w-1/2">
          <SectionCard title="Next Submission Deadline">
            {nextTournament.isLoading ? (
              <Spinner size="md" />
            ) : nextTournament.isSuccess && nextTournament.data !== null ? (
              <CountdownDigital date={nextTournament.data.submission_freeze} />
            ) : (
              "No upcoming submission deadlines."
            )}
          </SectionCard>
          {userTeam.isSuccess && (
            <SectionCard title="Scrimmaging Record">
              <ScrimmagingRecord
                team={userTeam.data}
                hideRanked={true}
                hideUnranked={true}
              />
            </SectionCard>
          )}
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
          <SectionCard title="Welcome!">
            <span>Welcome to {episode.data?.name_long}!</span>
            <span>{episode.data?.blurb}</span>
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
            <TeamChart
              yAxisLabel="Rating"
              values={topTeamRatingData}
              loading={topRatingHistory.isLoading}
              loadingMessage="Loading rankings data..."
            />
          </SectionCard>
          {/* <SectionCard title="Announcements">ANNOUNCEMENTS (TODO)</SectionCard> */}
        </div>
      </div>
    </div>
  );
};

export default Home;
