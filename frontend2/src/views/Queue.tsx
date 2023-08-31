import React, { useContext, useEffect, useRef, useState } from "react";
import { PageTitle } from "../components/elements/BattlecodeStyle";
import type {
  PaginatedTeamPublicList,
  PaginatedMatchList,
  TeamPublic,
} from "../utils/types";
import { useSearchParams } from "react-router-dom";
import { getAllMatches, getScrimmagesByTeam } from "../utils/api/compete";
import { EpisodeContext } from "../contexts/EpisodeContext";
import BattlecodeTable from "../components/BattlecodeTable";
import BattlecodeTableBottomElement from "../components/BattlecodeTableBottomElement";
import Button from "../components/elements/Button";
import RatingDelta from "../components/compete/RatingDelta";
import MatchScore from "../components/compete/MatchScore";
import MatchStatus from "../components/compete/MatchStatus";
import { searchTeams } from "../utils/api/team";
import { debounce } from "lodash";
import AsyncSelectMenu from "../components/elements/AsyncSelectMenu";
import type { Maybe } from "../utils/utilTypes";

const Queue: React.FC = () => {
  const episodeId = useContext(EpisodeContext).episodeId;

  const [queryParams, setQueryParams] = useSearchParams({
    page: "1",
  });

  const page = parseInt(queryParams.get("page") ?? "1");

  const [teamId, setTeamId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<Maybe<PaginatedMatchList>>(undefined);
  const [teamsData, setTeamsData] = useState<Maybe<TeamPublic[]>>(undefined);
  const [teamsLoading, setTeamsLoading] = useState<boolean>(true);
  const teamsEverLoaded = useRef<boolean>(false);

  function handlePage(page: number): void {
    if (!loading) {
      setQueryParams({ ...queryParams, page: page.toString() });
    }
  }

  async function refreshData(): Promise<void> {
    setLoading(true);
    setData((prev) => ({ count: prev?.count }));
    try {
      const result: PaginatedMatchList =
        teamId === null
          ? await getAllMatches(episodeId, page)
          : await getScrimmagesByTeam(episodeId, teamId, page);
      setData(result);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  const loadTeamOptions = async (inputValue: string): Promise<void> => {
    setTeamsLoading(true);
    try {
      const result: PaginatedTeamPublicList = await searchTeams(
        episodeId,
        inputValue,
        true,
        1,
      );
      setTeamsData(result.results);
    } catch (err) {
      console.error(err);
    }
    setTeamsLoading(false);
  };

  const debouncedLoadTeamOptions = debounce(loadTeamOptions, 500);

  useEffect(() => {
    void refreshData();
  }, [page, teamId]);

  useEffect(() => {
    if (!teamsEverLoaded.current) {
      teamsEverLoaded.current = true;
      void debouncedLoadTeamOptions("");
    }

    return () => {
      teamsEverLoaded.current = false;
    };
  }, []);

  return (
    <div className="mb-20 ml-4 mt-4 flex w-5/6 flex-col">
      <div className="justify-right mb-1 flex flex-row space-x-4 ">
        <PageTitle>Recent Queue</PageTitle>
        <Button
          disabled={loading}
          label="Refresh!"
          variant="dark"
          onClick={() => {
            handlePage(1);
            if (page === 1) {
              void refreshData();
            }
          }}
        />
      </div>
      <div className="min-w-96 mb-4 grid w-2/3 grid-cols-2 gap-5">
        <AsyncSelectMenu<number>
          onChange={(selectedId) => {
            setTeamId(selectedId);
            handlePage(1);
          }}
          value={teamId}
          options={
            teamsData?.map((t) => ({
              value: t.id,
              label: t.name,
            })) ?? []
          }
          loadOptions={debouncedLoadTeamOptions}
          loading={teamsLoading}
          placeholder="Search for a team..."
        />
      </div>
      <BattlecodeTable
        data={data?.results ?? []}
        loading={loading}
        bottomElement={
          <BattlecodeTableBottomElement
            totalCount={data?.count ?? 0}
            pageSize={10}
            currentPage={page}
            onPage={(page) => {
              handlePage(page);
            }}
          />
        }
        columns={[
          {
            header: "Team (Δ)",
            value: (r) => {
              const participant = r.participants[0];
              if (participant !== undefined) {
                return (
                  <RatingDelta participant={participant} ranked={r.is_ranked} />
                );
              }
            },
          },
          {
            header: "Score",
            value: (r) => <MatchScore match={r} />,
          },
          {
            header: "Team (Δ)",
            value: (r) => {
              const participant = r.participants[1];
              if (participant !== undefined) {
                return (
                  <RatingDelta participant={participant} ranked={r.is_ranked} />
                );
              }
            },
          },
          {
            header: "Ranked?",
            value: (r) => (r.is_ranked ? "Ranked" : "Unranked"),
          },
          {
            header: "Status",
            value: (r) => <MatchStatus match={r} />,
          },
          {
            header: "Created",
            value: (r) => new Date(r.created).toLocaleString(),
          },
        ]}
      />
    </div>
  );
};

export default Queue;
