import React, { useEffect, useMemo, useState } from "react";
import { useEpisode, useEpisodeId } from "../contexts/EpisodeContext";
import type {
  EligibilityCriterion,
  PaginatedTeamPublicList,
} from "../utils/types";
import { useSearchParams } from "react-router-dom";
import Input from "../components/elements/Input";
import Button from "../components/elements/Button";
import { searchTeams } from "../utils/api/team";
import { PageTitle } from "../components/elements/BattlecodeStyle";
import RankingsTable from "../components/tables/RankingsTable";
import { getParamEntries, parsePageParam } from "../utils/searchParamHelpers";

interface QueryParams {
  page: number;
  search: string;
}

const Rankings: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const episode = useEpisode();

  const [searchText, setSearchText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<PaginatedTeamPublicList | undefined>(
    undefined,
  );

  const [searchParams, setSearchParams] = useSearchParams();

  const queryParams: QueryParams = useMemo(() => {
    return {
      page: parsePageParam("page", searchParams),
      search: searchParams.get("search") ?? "",
    };
  }, [searchParams]);

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
    if (!loading) {
      setSearchParams({ ...queryParams, page: page.toString() });
    }
  }

  function handleSearch(): void {
    if (!loading && searchText !== queryParams.search) {
      setSearchParams((prev) => ({
        ...getParamEntries(prev),
        search: searchText,
        page: "1",
      }));
    }
  }

  useEffect(() => {
    let isActiveLookup = true;
    if (loading) return;
    setLoading(true);
    setData((prev) => ({ count: prev?.count ?? 0 }));

    const search = async (): Promise<void> => {
      try {
        const result = await searchTeams(
          episodeId,
          queryParams.search,
          false,
          queryParams.page,
        );
        if (isActiveLookup) {
          setData(result);
        }
      } catch (err) {
        if (isActiveLookup) {
          setData(undefined);
        }
        console.error(err);
      } finally {
        if (isActiveLookup) {
          setLoading(false);
        }
      }
    };

    void search();

    return () => {
      isActiveLookup = false;
    };
  }, [queryParams.search, queryParams.page, episodeId]);

  return (
    <div className="flex h-full w-full flex-col overflow-auto p-6">
      <div className="items-left flex w-4/5 flex-col">
        <PageTitle>Rankings</PageTitle>
        <div className="mb-4 flex w-3/5 flex-row">
          <Input
            disabled={loading}
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
            disabled={loading}
            label="Search!"
            variant="dark"
            onClick={() => {
              handleSearch();
            }}
          />
        </div>
      </div>

      <RankingsTable
        data={data}
        loading={loading}
        page={queryParams.page}
        eligibilityMap={eligibilityMap}
        handlePage={handlePage}
      />
    </div>
  );
};

export default Rankings;
