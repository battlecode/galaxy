import React, { useEffect, useMemo, useState } from "react";
import { PageTitle } from "../components/elements/BattlecodeStyle";
import type { PaginatedMatchList } from "../utils/types";
import { useSearchParams } from "react-router-dom";
import { getAllMatches, getScrimmagesByTeam } from "../utils/api/compete";
import { useEpisodeId } from "../contexts/EpisodeContext";
import Button from "../components/elements/Button";
import AsyncSelectMenu from "../components/elements/AsyncSelectMenu";
import type { Maybe } from "../utils/utilTypes";
import { loadTeamOptions } from "../utils/loadTeams";
import QueueTable from "../components/tables/QueueTable";
import { getParamEntries, parsePageParam } from "../utils/searchParamHelpers";

interface QueryParams {
  page: number;
}

const Queue: React.FC = () => {
  const { episodeId } = useEpisodeId();

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
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<Maybe<PaginatedMatchList>>(undefined);

  // TODO: in future, also call getTournamentMatches (by team)
  // and "mix" the results ordered by created_at
  async function refreshData(): Promise<void> {
    if (loading) return;
    setLoading(true);
    setData((prev) => ({ count: prev?.count ?? 0 }));
    try {
      const result: PaginatedMatchList =
        selectedTeam === null
          ? await getAllMatches(episodeId, queryParams.page)
          : await getScrimmagesByTeam(
              episodeId,
              selectedTeam.value,
              queryParams.page,
            );
      setData(result);
    } catch (err) {
      setData(undefined);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handlePage = (page: number): void => {
    if (!loading) {
      setSearchParams((prev) => ({
        ...getParamEntries(prev),
        page: page.toString(),
      }));
    }
  };

  /**
   * A wrapper function that returns the value/label pairs for the AsyncSelectMenu.
   * @param inputValue The search string from the menu
   * @returns An array of value/label pairs for the menu
   */
  const loadSelectOptions = async (
    inputValue: string,
  ): Promise<Array<{ value: number; label: string }>> => {
    return await loadTeamOptions(episodeId, inputValue, true, 1);
  };

  useEffect(() => {
    void refreshData();
  }, [queryParams.page, selectedTeam]);

  return (
    <div className="flex h-full w-full flex-col overflow-auto p-6">
      <div className="justify-right mb-1 flex flex-row space-x-4">
        <PageTitle>Recent Queue</PageTitle>
        <Button
          disabled={loading}
          label="Refresh!"
          variant="dark"
          onClick={() => {
            handlePage(1);
            if (queryParams.page === 1) {
              void refreshData();
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
          loadOptions={loadSelectOptions}
          placeholder="Search for a team..."
        />
      </div>
      <QueueTable
        data={data}
        loading={loading}
        page={queryParams.page}
        handlePage={handlePage}
      />
    </div>
  );
};

export default Queue;
