import React, { useContext, useEffect, useState } from "react";
import { PageTitle } from "../components/elements/BattlecodeStyle";
import { type PaginatedMatchList } from "../utils/types";
import { useSearchParams } from "react-router-dom";
import { getAllMatches, getScrimmagesByTeam } from "../utils/api/compete";
import { EpisodeContext } from "../contexts/EpisodeContext";
import BattlecodeTable from "../components/BattlecodeTable";
import BattlecodeTableBottomElement from "../components/BattlecodeTableBottomElement";
import Button from "../components/elements/Button";
import RatingDelta from "../components/compete/RatingDelta";
import MatchScore from "../components/compete/MatchScore";
import MatchStatus from "../components/compete/MatchStatus";

const Queue: React.FC = () => {
  const episodeId = useContext(EpisodeContext).episodeId;

  const [queryParams, setQueryParams] = useSearchParams({
    page: "1",
  });

  const page = parseInt(queryParams.get("page") ?? "1");
  const teamId = !isNaN(parseInt(queryParams.get("teamId") ?? ""))
    ? parseInt(queryParams.get("teamId") ?? "")
    : null;

  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<PaginatedMatchList | undefined>(undefined);

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

  useEffect(() => {
    void refreshData();
  }, [page, teamId]);

  return (
    <div className="mb-20 ml-4 mt-4 flex w-5/6 flex-col">
      <div className="justify-right mb-2 flex flex-row space-x-4 ">
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
      {/* TODO: Team Select! */}
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
