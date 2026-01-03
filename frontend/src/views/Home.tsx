import type React from "react";
import { useEpisodeId } from "../contexts/EpisodeContext";
import { useEpisodeInfo } from "../api/episode/useEpisode";
import SectionCard from "../components/SectionCard";
import { SocialIcon } from "react-social-icons";
import TeamChart from "../components/compete/chart/TeamChart";
import ScrimmagingRecord from "components/compete/ScrimmagingRecord";
import { useUserTeam } from "api/team/useTeam";
import { useTopRatingHistoryList } from "api/compete/useCompete";
import UserChart from "components/compete/chart/UserChart";
import { useCurrentUser } from "contexts/CurrentUserContext";
import { PageContainer } from "components/elements/BattlecodeStyle";
import { isPresent } from "utils/utilTypes";
import { dateTime } from "utils/dateTime";
import Markdown from "components/elements/Markdown";
import HomeCountdown from "components/HomeCountdown";

const Home: React.FC = () => {
  const TOP_TEAMS = 10;

  const { episodeId } = useEpisodeId();
  const episode = useEpisodeInfo({ id: episodeId });
  const topRatingHistory = useTopRatingHistoryList({ episodeId, n: TOP_TEAMS });
  const userTeam = useUserTeam({ episodeId });
  const currentUser = useCurrentUser();

  const SOCIAL =
    "hover:drop-shadow-lg hover:opacity-80 transition-opacity duration-300 ease-in-out";

  // This is a temporary message until we have a working countdown :)
  let WELCOME =
    episode.isSuccess && isPresent(episode.data.blurb)
      ? episode.data.blurb
      : `Welcome!`;

  if (episode.isSuccess && episode.data.game_release.getTime() > Date.now()) {
    WELCOME += `
\n\n
The competition will be launched on **${
      dateTime(episode.data.game_release).localFullString
    }**.\n\n
In the meantime, [create or join a team](/${episodeId}/my_team) and check out the [quick start](/${episodeId}/quick_start) page.`;
  }

  return (
    <PageContainer>
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
            <Markdown text={WELCOME} />
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
          <SectionCard
            title="Rating History"
            loading={currentUser.user.isLoading}
          >
            {currentUser.user.isSuccess ? (
              <UserChart
                userId={currentUser.user.data.id}
                lockedEpisode={episodeId}
              />
            ) : (
              "Sign in to view your rating history!"
            )}
          </SectionCard>
        </div>
        <div className="flex w-full flex-col gap-6 xl:w-1/2">
          <HomeCountdown />

          <SectionCard title="Social Media">
            <div className="flex w-full flex-row items-center justify-evenly pt-2">
              <SocialIcon url="https://discord.gg/N86mxkH" className={SOCIAL} />
              <SocialIcon
                url="https://www.youtube.com/@MITBattlecode"
                className={SOCIAL}
              />
              <SocialIcon
                url="https://x.com/mitbattlecode"
                className={SOCIAL}
              />
              <SocialIcon
                url="https://www.instagram.com/mitbattlecode"
                className={SOCIAL}
              />
              <SocialIcon
                url="https://www.github.com/battlecode"
                className={SOCIAL}
              />
            </div>
          </SectionCard>
          <SectionCard title="Top Teams">
            <TeamChart
              teamRatings={topRatingHistory.data ?? []}
              loading={topRatingHistory.isLoading}
              crownTop
            />
          </SectionCard>
        </div>
      </div>
    </PageContainer>
  );
};

export default Home;
