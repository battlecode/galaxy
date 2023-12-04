import React from "react";
import { NavLink } from "react-router-dom";
import { useCurrentTeam } from "../../../contexts/CurrentTeamContext";
import { dateTime } from "../../../utils/dateTime";
import type { PaginatedMatchList } from "../../../utils/types";
import type { Maybe } from "../../../utils/utilTypes";
import Table from "../../Table";
import TableBottom from "../../TableBottom";
import MatchScore from "../../compete/MatchScore";
import MatchStatus from "../../compete/MatchStatus";
import RatingDelta from "../../compete/RatingDelta";
import { useEpisodeInfo } from "../../../api/episode/useEpisode";
import { useEpisodeId } from "../../../contexts/EpisodeContext";
import { useUserTeam } from "../../../api/team/useTeam";

interface ScrimHistoryTableProps {
  data: Maybe<PaginatedMatchList>;
  page: number;
  loading: boolean;
  handlePage: (page: number) => void;
}

const ScrimHistoryTable: React.FC<ScrimHistoryTableProps> = ({
  data,
  page,
  loading,
  handlePage,
}) => {
  const { episodeId } = useEpisodeId();
  const { data: episode } = useEpisodeInfo({ id: episodeId });
  const { data: currentTeam } = useUserTeam({ episodeId });

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
          header: "Score",
          key: "score",
          value: (match) => {
            return <MatchScore match={match} userTeamId={currentTeam?.id} />;
          },
        },
        {
          header: "Opponent (Δ)",
          key: "opponent",
          value: (match) => {
            const opponent = match.participants?.find(
              (p) => currentTeam !== undefined && p.team !== currentTeam.id,
            );
            if (opponent === undefined) return;
            return (
              <RatingDelta participant={opponent} ranked={match.is_ranked} />
            );
          },
        },
        {
          header: "Ranked",
          key: "ranked",
          value: (match) => (match.is_ranked ? "Ranked" : "Unranked"),
        },
        {
          header: "Status",
          key: "status",
          value: (match) => <MatchStatus match={match} />,
        },
        {
          header: "Replay",
          key: "replay",
          value: (match) =>
            episode === undefined ? (
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
          value: (match) => dateTime(match.created).localFullString,
        },
      ]}
    />
  );
};

export default ScrimHistoryTable;
