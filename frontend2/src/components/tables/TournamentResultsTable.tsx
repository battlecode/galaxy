import React from "react";
import { NavLink } from "react-router-dom";
import { dateTime } from "../../utils/dateTime";
import {
  StatusBccEnum,
  type PaginatedMatchList,
  type Episode,
} from "../../api/_autogen";
import type { Maybe } from "../../utils/utilTypes";
import Table from "../Table";
import TableBottom from "../TableBottom";
import MatchScore from "../compete/MatchScore";
import MatchStatus from "../compete/MatchStatus";
import RatingDelta from "../compete/RatingDelta";
import { isNil } from "lodash";

interface TournamentResultsTableProps {
  data: Maybe<PaginatedMatchList>;
  loading: boolean;
  page: number;
  episode: Maybe<Episode>;
  handlePage: (page: number) => void;
}

const TournamentResultsTable: React.FC<TournamentResultsTableProps> = ({
  data,
  loading,
  page,
  episode,
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
          value: (match) =>
            isNil(episode) ||
            match.status !== StatusBccEnum.Ok ||
            isNil(match.replay_url) ? (
              <></>
            ) : (
              <NavLink
                className="text-cyan-600 hover:underline"
                to={`https://releases.battlecode.org/client/${
                  episode.artifact_name ?? ""
                }/${episode.release_version_public ?? ""}/visualizer.html?${
                  match.replay_url
                }`}
              >
                Replay!
              </NavLink>
            ),
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

export default TournamentResultsTable;
