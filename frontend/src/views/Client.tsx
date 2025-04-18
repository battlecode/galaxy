import type React from "react";
import { useEpisodeInfo } from "api/episode/useEpisode";
import ResponsiveIframe from "components/ResponsiveIframe";
import { useEpisodeId } from "contexts/EpisodeContext";
import { useUserScrimmageList } from "api/compete/useCompete";
import { useQueryClient } from "@tanstack/react-query";
import SelectMenu from "components/elements/SelectMenu";
import { StatusBccEnum, type Match } from "api/_autogen";
import MatchScore from "components/compete/MatchScore";
import { dateTime } from "utils/dateTime";
import { useMemo, useRef, useState } from "react";
import { useUserTeam } from "api/team/useTeam";
import { PageButtonsList } from "components/TableBottom";
import { getClientUrl } from "api/helpers";

const Client: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();

  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedPage, setSelectedPage] = useState<number>(1);

  const userTeam = useUserTeam({ episodeId });
  const episode = useEpisodeInfo({ id: episodeId });
  const matches = useUserScrimmageList(
    { episodeId, page: selectedPage },
    queryClient,
  );

  const clientUrl = getClientUrl(
    episode.data?.name_short,
    episode.data?.artifact_name,
    episode.data?.release_version_client,
    selectedMatch?.replay_url,
  );

  const matchToOption = (
    match: Match,
  ): {
    value: number;
    label: React.JSX.Element;
  } => {
    const opponent = match.participants?.find(
      (p) => p.team !== userTeam.data?.id,
    );

    return {
      value: match.id,
      label: (
        <div className="flex flex-row items-center gap-4">
          {userTeam.isSuccess && (
            <MatchScore match={match} userTeamId={userTeam.data.id} />
          )}
          <span className="text-gray-800">{opponent?.teamname ?? "???"}</span>
          <span className="italic text-gray-600">
            {dateTime(match.created).localShortStr}
          </span>
        </div>
      ),
    };
  };

  const prevCount = useRef(0);

  const stabilizedDisplayCount: number = useMemo(() => {
    // While we are reloading the query, we want to display the previous count.
    if (!matches.isSuccess) {
      return prevCount.current;
    } else {
      prevCount.current = matches.data.count ?? 0; // Update the previous count
      return matches.data.count ?? 0;
    }
  }, [matches]);

  return (
    <div className="flex h-full min-h-screen w-full flex-col gap-2 p-6">
      <div className="flex max-h-min w-full flex-1 flex-col items-center gap-4 md:flex-row md:gap-2">
        <SelectMenu
          loading={matches.isLoading || userTeam.isLoading}
          className="w-full md:max-w-96"
          placeholder="Select a match"
          options={
            matches.data?.results
              ?.filter((match) => match.status === StatusBccEnum.Ok)
              .map(matchToOption) ?? []
          }
          value={selectedMatch?.id}
          onChange={(value) => {
            setSelectedMatch(
              matches.data?.results?.find((m) => m.id === value) ?? null,
            );
          }}
        />
        <PageButtonsList
          recordCount={stabilizedDisplayCount}
          pageSize={10}
          currentPage={selectedPage}
          onPage={(page) => {
            setSelectedPage(page);
          }}
        />
      </div>

      <ResponsiveIframe url={clientUrl ?? ""} className="flex flex-1" />
    </div>
  );
};

export default Client;
