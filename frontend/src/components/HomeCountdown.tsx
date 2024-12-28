import { useEpisodeInfo, useNextTournament } from "api/episode/useEpisode";
import { useEpisodeId } from "contexts/EpisodeContext";
import { useMemo } from "react";
import CountdownDisplay from "./CountdownDisplay";
import SectionCard from "./SectionCard";
import { isNil } from "lodash";

const HomeCountdown: React.FC = () => {
  const { episodeId } = useEpisodeId();

  const episode = useEpisodeInfo({ id: episodeId });
  const nextTournament = useNextTournament({ episodeId });

  const title = useMemo(() => {
    if (!episode.isSuccess) {
      return "";
    } else if (episode.data.game_release.getTime() > Date.now()) {
      return "Countdown to Game Release";
    } else {
      return "Next Submission Deadline";
    }
  }, [episode]);

  const date = useMemo(() => {
    if (!episode.isSuccess) {
      return undefined;
    } else if (episode.data.game_release.getTime() > Date.now()) {
      return episode.data.game_release;
    } else if (nextTournament.isSuccess) {
      return nextTournament.data?.submission_freeze;
    } else {
      return undefined;
    }
  }, [episode, nextTournament]);

  return (
    <SectionCard
      title={title}
      loading={episode.isLoading || nextTournament.isLoading}
    >
      {!isNil(date) ? (
        <CountdownDisplay date={date} />
      ) : (
        <span>No upcoming submission deadlines.</span>
      )}
    </SectionCard>
  );
};

export default HomeCountdown;
