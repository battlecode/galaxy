import type React from "react";
import { useMemo, useState } from "react";
import { useEpisodeId } from "../contexts/EpisodeContext";
import { useSearchParams } from "react-router-dom";
import Input from "../components/elements/Input";
import Button from "../components/elements/Button";
import { PageTitle } from "../components/elements/BattlecodeStyle";
import RankingsTable from "../components/tables/RankingsTable";
import { getParamEntries, parsePageParam } from "../utils/searchParamHelpers";
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

  const queryParams: QueryParams = useMemo(
    () => ({
      page: parsePageParam("page", searchParams),
      search: searchParams.get("search") ?? "",
    }),
    [searchParams],
  );

  const rankingsData = useSearchTeams(
    {
      episodeId,
      page: queryParams.page,
      search: queryParams.search,
    },
    queryClient,
  );

  function handlePage(page: number): void {
    if (!rankingsData.isLoading) {
      setSearchParams({ ...queryParams, page: page.toString() });
    }
  }

  function handleSearch(): void {
    if (!rankingsData.isLoading && searchText !== queryParams.search) {
      setSearchParams((prev) => ({
        ...getParamEntries(prev),
        search: searchText,
        page: "1",
      }));
    }
  }

  return (
    <div className="flex flex-col p-6">
      <div className="items-left flex flex-1 flex-col">
        <PageTitle>Rankings</PageTitle>
        <div className="mb-4 flex flex-row gap-4">
          <Input
            disabled={rankingsData.isLoading}
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
            className="w-80 sm:w-52 md:w-80 lg:w-96"
          />

          <Button
            disabled={rankingsData.isLoading}
            label="Search!"
            variant="dark"
            onClick={() => {
              handleSearch();
            }}
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <RankingsTable
          data={rankingsData.data}
          loading={rankingsData.isLoading}
          page={queryParams.page}
          handlePage={handlePage}
        />
      </div>
    </div>
  );
};

export default Rankings;
