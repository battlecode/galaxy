import type React from "react";
import { useMemo, useState } from "react";
import { useEpisodeId } from "../contexts/EpisodeContext";
import { useSearchParams } from "react-router-dom";
import Input from "../components/elements/Input";
import Button from "../components/elements/Button";
import {
  PageTitle,
  PageContainer,
} from "../components/elements/BattlecodeStyle";
import RankingsTable from "../components/tables/RankingsTable";
import { getParamEntries, parsePageParam } from "../utils/searchParamHelpers";
import { useSearchTeams } from "../api/team/useTeam";
import { useQueryClient } from "@tanstack/react-query";
import SelectMultipleMenu from "components/elements/SelectMultipleMenu";
import { useEpisodeInfo } from "api/episode/useEpisode";
import EligibilityIcon from "components/EligibilityIcon";

interface QueryParams {
  page: number;
  search: string;
  eligibleFor: string[];
}

const eligibleEqual = (eligible1: number[], eligible2: number[]): boolean =>
  eligible1.length === eligible2.length &&
  eligible1.every((el1) => eligible2.includes(el1));

const Rankings: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();

  const [searchText, setSearchText] = useState<string>("");
  const [searchParams, setSearchParams] = useSearchParams();

  const queryParams: QueryParams = useMemo(
    () => ({
      page: parsePageParam("page", searchParams),
      search: searchParams.get("search") ?? "",
      eligibleFor: searchParams.getAll("eligibleFor"),
    }),
    [searchParams],
  );

  const [eligibleFor, setEligibleFor] = useState<number[]>(
    queryParams.eligibleFor.map((el) => parseInt(el)),
  );

  const episode = useEpisodeInfo({ id: episodeId });
  const rankingsData = useSearchTeams(
    {
      episodeId,
      page: queryParams.page,
      search: queryParams.search,
      eligibleFor:
        queryParams.eligibleFor.length > 0
          ? queryParams.eligibleFor.map((el) => parseInt(el))
          : undefined,
    },
    queryClient,
  );

  function handlePage(page: number): void {
    if (!rankingsData.isLoading) {
      setSearchParams({ ...queryParams, page: page.toString() });
    }
  }

  function handleSearch(): void {
    if (
      !rankingsData.isLoading &&
      (searchText !== queryParams.search ||
        !eligibleEqual(
          queryParams.eligibleFor.map((el) => parseInt(el)),
          eligibleFor,
        ))
    ) {
      setSearchParams((prev) => ({
        ...getParamEntries(prev),
        search: searchText,
        eligibleFor: eligibleFor.map((el) => el.toFixed(0)),
        page: "1",
      }));
    }
  }

  return (
    <PageContainer>
      <div className="items-left flex flex-1 flex-col">
        <PageTitle>Rankings</PageTitle>
        <div className="mb-4 flex flex-col gap-4 md:flex-row">
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

          <SelectMultipleMenu<number>
            className="min-w-60 max-w-96"
            disabled={episode.isLoading || rankingsData.isLoading}
            options={
              episode.data?.eligibility_criteria.map((el) => ({
                value: el.id,
                label: (
                  <div
                    key={el.id}
                    className="justify-left flex w-full flex-1 flex-row items-center gap-4 overflow-hidden"
                  >
                    <div className="text-gray-800">{el.title}</div>
                    <EligibilityIcon criterion={el} />
                  </div>
                ),
              })) ?? []
            }
            placeholder="Eligibility to include..."
            value={eligibleFor}
            onChange={setEligibleFor}
          />

          <Button
            loading={
              rankingsData.isLoading &&
              (searchText !== "" || eligibleFor.length > 0)
            }
            disabled={rankingsData.isLoading}
            label="Search!"
            variant="dark"
            onClick={() => {
              handleSearch();
            }}
          />
        </div>
      </div>

      <RankingsTable
        data={rankingsData.data}
        eligibleFor={queryParams.eligibleFor}
        loading={rankingsData.isLoading}
        page={queryParams.page}
        handlePage={handlePage}
      />
    </PageContainer>
  );
};

export default Rankings;
