import type React from "react";
import { useEpisodeInfo } from "api/episode/useEpisode";
import ResponsiveIframe from "components/ResponsiveIframe";
import { useEpisodeId } from "contexts/EpisodeContext";
import Collapse from "components/elements/Collapse";
import { useUserScrimmageList } from "api/compete/useCompete";
import { useQueryClient } from "@tanstack/react-query";
import SelectMenu from "components/elements/SelectMenu";
import { StatusBccEnum, type Match } from "api/_autogen";
import MatchScore from "components/compete/MatchScore";
import { dateTime } from "utils/dateTime";
import { useState } from "react";
import { useUserTeam } from "api/team/useTeam";
import { PageButtonsList } from "components/TableBottom";
import { isPresent } from "utils/utilTypes";

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

  const url = `https://releases.battlecode.org/client/${
    episode.data?.artifact_name ?? ""
  }/${episode.data?.release_version_public ?? ""}/index.html${
    isPresent(selectedMatch) ? `?gameSource=${selectedMatch.replay_url}` : ""
  }`;

  const matchToOption = (
    match: Match,
  ): {
    value: number;
    label: JSX.Element;
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
            {dateTime(match.created).shortDateStr}
          </span>
        </div>
      ),
    };
  };

  return (
    <div className="flex h-full w-full flex-col gap-2 p-6">
      <div className="flex w-full flex-1 flex-col items-center gap-4 md:flex-row md:gap-2">
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
          totalCount={matches.data?.count ?? 0}
          pageSize={10}
          currentPage={selectedPage}
          onPage={(page) => {
            setSelectedPage(page);
          }}
        />
      </div>

      <ResponsiveIframe url={url} />
    </div>
  );
};

export default Client;
