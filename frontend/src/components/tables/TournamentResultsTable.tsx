import type React from "react";
import { dateTime } from "../../utils/dateTime";
import type { PaginatedMatchList, Episode } from "../../api/_autogen";
import type { Maybe } from "../../utils/utilTypes";
import Table from "../Table";
import TableBottom from "../TableBottom";
import MatchScore from "../compete/MatchScore";
import MatchStatus from "../compete/MatchStatus";
import RatingDelta from "../compete/MatchRatingDelta";
import MatchReplayButton from "components/MatchReplayButton";
import type { UseQueryResult } from "@tanstack/react-query";

interface TournamentResultsTableProps {
  data: Maybe<PaginatedMatchList>;
  loading: boolean;
  page: number;
  episode: UseQueryResult<Episode>;
  handlePage: (page: number) => void;
}

const TournamentResultsTable: React.FC<TournamentResultsTableProps> = ({
  data,
  loading,
  page,
  episode,
  handlePage,
}) => (
  <Table
    data={data?.results ?? []}
    loading={loading}
    keyFromValue={(match) => match.id.toString()}
    bottomElement={
      <TableBottom
        totalCount={data?.count ?? 0}
        pageSize={10}
        currentPage={page}
        onPage={handlePage}
      />
    }
    columns={[
      {
        header: "Team (Δ)",
        key: "team1",
        value: (r) => {
          const participant = r.participants?.[0];
          if (participant !== undefined) {
            return (
              <RatingDelta participant={participant} ranked={r.is_ranked} />
            );
          }
        },
      },
      {
        header: "Score",
        key: "score",
        value: (r) => <MatchScore match={r} />,
      },
      {
        header: "Team (Δ)",
        key: "team2",
        value: (r) => {
          const participant = r.participants?.[1];
          if (participant !== undefined) {
            return (
              <RatingDelta participant={participant} ranked={r.is_ranked} />
            );
          }
        },
      },
      {
        header: "Ranked?",
        key: "ranked",
        value: (r) => (r.is_ranked ? "Ranked" : "Unranked"),
      },
      {
        header: "Status",
        key: "status",
        value: (r) => <MatchStatus match={r} />,
      },
      {
        header: "Replay",
        key: "replay",
        value: (match) => <MatchReplayButton episode={episode} match={match} />,
      },
      {
        header: "Created",
        key: "created",
        value: (r) => dateTime(r.created).localFullString,
      },
    ]}
  />
);

export default TournamentResultsTable;
