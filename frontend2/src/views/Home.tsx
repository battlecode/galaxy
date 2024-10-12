import React from "react";
import { useEpisodeId } from "../contexts/EpisodeContext";
import { useEpisodeInfo, useNextTournament } from "../api/episode/useEpisode";
import SectionCard from "../components/SectionCard";
import CountdownDigital from "../components/CountdownDigital";
import { SocialIcon } from "react-social-icons";
import TeamChart from "../components/compete/chart/TeamChart";
import { useQueryClient } from "@tanstack/react-query";
import ScrimmagingRecord from "components/compete/ScrimmagingRecord";
import { useSearchTeams, useUserTeam } from "api/team/useTeam";
import { isPresent } from "utils/utilTypes";

const Home: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const episode = useEpisodeInfo({ id: episodeId });
  const nextTournament = useNextTournament({ episodeId });
  const topRatingHistory = useTopRatingHistoryList({ episodeId, n: 10 });
  const userTeam = useUserTeam({ episodeId });

  const SOCIAL =
    "hover:drop-shadow-lg hover:opacity-80 transition-opacity duration-300 ease-in-out";

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
              teamIds={userTeam.isSuccess ? [userTeam.data.id] : []}
              loading={userTeam.isLoading}
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
            <TeamChart
              teamIds={topTeams.data?.results?.map((t) => t.id) ?? []}
              loading={topTeams.isLoading}
            />
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default Home;
