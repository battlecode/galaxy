import React, { useMemo, useState } from "react";
import { useEpisodeId } from "../contexts/EpisodeContext";
import type { EligibilityCriterion } from "../api/_autogen";
import { useSearchParams } from "react-router-dom";
import Input from "../components/elements/Input";
import Button from "../components/elements/Button";
import { PageTitle } from "../components/elements/BattlecodeStyle";
import RankingsTable from "../components/tables/RankingsTable";
import { getParamEntries, parsePageParam } from "../utils/searchParamHelpers";
import { useEpisodeInfo } from "../api/episode/useEpisode";
import { useSearchTeams } from "../api/team/useTeam";
import { useQueryClient } from "@tanstack/react-query";

interface QueryParams {
  page: number;
  search: string;
}

const Rankings: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();

  const [searchText, setSearchText] = useState<string>("");
  const [searchParams, setSearchParams] = useSearchParams();

  const queryParams: QueryParams = useMemo(() => {
    return {
      page: parsePageParam("page", searchParams),
      search: searchParams.get("search") ?? "",
    };
  }, [searchParams]);

  const { data: episode } = useEpisodeInfo({ id: episodeId });
  const { data: rankingsData, isLoading: rankingsLoading } = useSearchTeams(
    {
      episodeId,
      page: queryParams.page,
      search: queryParams.search,
    },
    queryClient,
  );

  /**
   * This enables us to look up eligibility criteria by index in the table component.
   */
  const eligibilityMap: Map<number, EligibilityCriterion> = useMemo(() => {
    if (episode === undefined) {
      return new Map<number, EligibilityCriterion>();
    }
    return new Map(
      episode.eligibility_criteria.map((crit, idx) => [idx, crit]),
    );
  }, [episode]);

  function handlePage(page: number): void {
    if (!rankingsLoading) {
      setSearchParams({ ...queryParams, page: page.toString() });
    }
  }

  function handleSearch(): void {
    if (!rankingsLoading && searchText !== queryParams.search) {
      setSearchParams((prev) => ({
        ...getParamEntries(prev),
        search: searchText,
        page: "1",
      }));
    }
  }

  return (
    <div className="flex h-full w-full flex-col overflow-auto p-6">
      <div className="items-left flex w-4/5 flex-col">
        <PageTitle>Rankings</PageTitle>
        <div className="mb-4 flex w-3/5 flex-row">
          <Input
            disabled={rankingsLoading}
            placeholder="Search for a team..."
            value={searchText}
            onChange={(ev) => {
              setSearchText(ev.target.value);
            }}
            onKeyDown={(ev) => {
              if (ev.key === "Enter" || ev.key === "NumpadEnter") {
                handleSearch();
              }
            }}
          />
          <div className="w-4" />
          <Button
            disabled={rankingsLoading}
            label="Search!"
            variant="dark"
            onClick={() => {
              handleSearch();
            }}
          />
        </div>
      </div>

      <RankingsTable
        data={rankingsData}
        loading={rankingsLoading}
        page={queryParams.page}
        eligibilityMap={eligibilityMap}
        handlePage={handlePage}
      />
    </div>
  );
};

export default Rankings;
