import type React from "react";
import { Fragment } from "react";
import Table from "components/Table";
import TableBottom from "components/TableBottom";
import MatchScore from "components/compete/MatchScore";
import MatchStatus from "components/compete/MatchStatus";
import { NavLink } from "react-router-dom";
import { dateTime } from "utils/dateTime";
import { useEpisodeId } from "contexts/EpisodeContext";
import { useEpisodeInfo } from "api/episode/useEpisode";
import { useUserTeam } from "api/team/useTeam";
import { useQueryClient } from "@tanstack/react-query";
import { useTournamentMatchList } from "api/compete/useCompete";
import MatchReplayButton from "components/MatchReplayButton";

interface TournamentMatchesTableProps {
  tourneyPage: number;
  handlePage: (page: number, key: "tourneyPage") => void;
}

const TournamentMatchesTable: React.FC<TournamentMatchesTableProps> = ({
  tourneyPage,
  handlePage,
}) => {
  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();
  const episodeData = useEpisodeInfo({ id: episodeId });
  const userTeamData = useUserTeam({ episodeId });
  const matchesData = useTournamentMatchList(
    {
      episodeId,
      teamId: userTeamData.data?.id,
      page: tourneyPage,
    },
    queryClient,
  );

  return (
    <Fragment>
      <h1 className="text-2xl font-bold leading-7 text-gray-900">
        Recent Tournament Matches
      </h1>
      <Table
        data={matchesData.data?.results ?? []}
        loading={matchesData.isLoading}
        keyFromValue={(match) => match.id.toString()}
        bottomElement={
          <TableBottom
            querySuccess={matchesData.isSuccess}
            totalCount={matchesData.data?.count ?? 0}
            pageSize={10}
            currentPage={tourneyPage}
            onPage={(page) => {
              handlePage(page, "tourneyPage");
            }}
          />
        }
        columns={[
          {
            header: "Score",
            key: "score",
            value: (match) => (
              <MatchScore match={match} userTeamId={userTeamData.data?.id} />
            ),
          },
          {
            header: "Opponent",
            key: "opponent",
            value: (match) => {
              const opponent = match.participants?.find(
                (p) =>
                  userTeamData.isSuccess && p.team !== userTeamData.data.id,
              );
              if (opponent === undefined) return;
              return (
                <NavLink
                  className="hover:underline"
                  to={`/${episodeId}/team/${opponent.team}`}
                >
                  {opponent.teamname}
                </NavLink>
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
            value: (match) => (
              <MatchReplayButton episode={episodeData} match={match} />
            ),
          },
          {
            header: "Created",
            key: "created",
            value: (match) => dateTime(match.created).localFullString,
          },
        ]}
      />
    </Fragment>
  );
};

export default TournamentMatchesTable;
