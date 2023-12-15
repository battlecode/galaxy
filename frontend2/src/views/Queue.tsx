import React, { useMemo, useState } from "react";
import { PageTitle } from "../components/elements/BattlecodeStyle";
import { useSearchParams } from "react-router-dom";
import { useEpisodeId } from "../contexts/EpisodeContext";
import Button from "../components/elements/Button";
import AsyncSelectMenu from "../components/elements/AsyncSelectMenu";
import { loadTeamOptions } from "../utils/loadTeams";
import QueueTable from "../components/tables/QueueTable";
import { getParamEntries, parsePageParam } from "../utils/searchParamHelpers";
import { useQueryClient } from "@tanstack/react-query";
import { useMatchList, useTeamScrimmageList } from "../api/compete/useCompete";
import { toast } from "react-hot-toast";
import { isPresent } from "../utils/utilTypes";

interface QueryParams {
  page: number;
}

const Queue: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();

  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams: QueryParams = useMemo(() => {
    return {
      page: parsePageParam("page", searchParams),
    };
  }, [searchParams]);

  const [selectedTeam, setSelectedTeam] = useState<{
    value: number;
    label: string;
  } | null>(null);

  // This is a hack since we don't support filtering the all matches endpoint by team
  const allMatchesData = useMatchList(
    {
      episodeId,
      page: queryParams.page,
    },
    queryClient,
  );
  const teamMatchesData = useTeamScrimmageList(
    {
      episodeId,
      teamId: selectedTeam?.value,
      // This prevents this hook from looking for pages that don't exist!
      page: isPresent(selectedTeam) ? queryParams.page : 1,
    },
    queryClient,
  );

  // Not going to memoize this... will use this to determine which data/loading to use
  const activeData = selectedTeam === null ? allMatchesData : teamMatchesData;

  const handlePage = (page: number): void => {
    setSearchParams((prev) => ({
      ...getParamEntries(prev),
      page: page.toString(),
    }));
  };

  return (
    <div className="flex h-full w-full flex-col overflow-auto p-6">
      <div className="justify-right mb-1 flex flex-row space-x-4">
        <PageTitle>Recent Queue</PageTitle>
        <Button
          disabled={activeData.isLoading}
          label="Refresh!"
          variant="dark"
          onClick={() => {
            handlePage(1);
            if (queryParams.page === 1) {
              // This is an IIFE. See https://stackoverflow.com/questions/63488141/promise-returned-in-function-argument-where-a-void-return-was-expected
              (async () => await activeData.refetch())().catch((e) =>
                toast.error((e as Error).message),
              );
            }
          }}
        />
      </div>
      <div className="mb-4 w-96 gap-5">
        <AsyncSelectMenu<number>
          onChange={(team) => {
            setSelectedTeam(team);
            handlePage(1);
          }}
          selected={selectedTeam}
          loadOptions={async (search) =>
            await loadTeamOptions(episodeId, search, 1)
          }
          placeholder="Search for a team..."
        />
      </div>
      <QueueTable
        data={activeData.data}
        loading={activeData.isLoading}
        page={queryParams.page}
        handlePage={handlePage}
      />
    </div>
  );
};

export default Queue;
