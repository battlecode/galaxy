import React, { useContext, useEffect, useState } from "react";
import { PageTitle } from "../components/elements/BattlecodeStyle";
import {
  StatusBccEnum,
  type Match,
  type PaginatedMatchList,
} from "../utils/types";
import { useSearchParams } from "react-router-dom";
import { getAllMatches, getScrimmagesByTeam } from "../utils/api/compete";
import { EpisodeContext } from "../contexts/EpisodeContext";
import BattlecodeTable from "../components/BattlecodeTable";
import BattlecodeTableBottomElement from "../components/BattlecodeTableBottomElement";
import Button from "../components/elements/Button";

interface QueryParams {
  page?: string;
  teamId?: string;
}

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

  const MatchStatusDisplay: Record<StatusBccEnum, string> = {
    [StatusBccEnum.New]: "Created",
    [StatusBccEnum.Que]: "Queued",
    [StatusBccEnum.Run]: "Running",
    [StatusBccEnum.Try]: "Will be retried",
    [StatusBccEnum.Ok]: "Success",
    [StatusBccEnum.Err]: "Failed",
    [StatusBccEnum.Can]: "Cancelled",
  };

  async function refreshData(): Promise<void> {
    setLoading(true);
    setData(undefined);
    try {
      const result: PaginatedMatchList =
        teamId === null
          ? // TODO: check what exactly getAllMatches returns
            await getAllMatches(episodeId, page)
          : await getScrimmagesByTeam(episodeId, teamId, page);
      setData(result);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  const ratingDeltaDisplay = (r: Match): number => {
    // TODO: implement the rating delta display!
    // Remember to account for ranked (has delta) vs. unranked (has no delta)
    return 0;
  };

  const scoreDisplay = (r: Match): JSX.Element => {
    return <></>;
  };

  useEffect(() => {
    void refreshData();
  }, [page, teamId]);

  return (
    <div className="mb-20 ml-10 flex w-full flex-col">
      <div className="justify-right flex flex-row space-x-4 ">
        <PageTitle>Recent Queue</PageTitle>
        <Button
          disabled={loading}
          label="Refresh!"
          variant="dark"
          onClick={() => {
            void refreshData();
          }}
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
            // TODO: implement the rating delta display and make this a link!
            value: (r) => r.participants[0]?.teamname,
          },
          // TODO: all the columns!!!
          {
            header: "Score",
            value: (r) => scoreDisplay(r),
          },
          {
            header: "Team (Δ)",
            // TODO: implement the rating delta display and make this a link!
            value: (r) => r.participants[1]?.teamname,
          },
          {
            header: "Ranked?",
            value: (r) => (r.is_ranked ? "Ranked" : "Unranked"),
          },
          {
            header: "Status",
            value: (r) => MatchStatusDisplay[r.status],
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
