import React from "react";
import { dateTime } from "../../utils/dateTime";
import type { PaginatedMatchList } from "../../api/_autogen";
import type { Maybe } from "../../utils/utilTypes";
import Table from "../Table";
import TableBottom from "../TableBottom";
import MatchScore from "../compete/MatchScore";
import MatchStatus from "../compete/MatchStatus";
import RatingDelta from "../compete/RatingDelta";

interface QueueTableProps {
  data: Maybe<PaginatedMatchList>;
  loading: boolean;
  page: number;
  handlePage: (page: number) => void;
}

const QueueTable: React.FC<QueueTableProps> = ({
  data,
  loading,
  page,
  handlePage,
}) => {
  return (
    <Table
      data={data?.results ?? []}
      loading={loading}
      keyFromValue={(match) => match.id.toString()}
      bottomElement={
        <TableBottom
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
          header: "Created",
          key: "created",
          value: (r) => dateTime(r.created).localFullString,
        },
      ]}
    />
  );
};

export default QueueTable;
