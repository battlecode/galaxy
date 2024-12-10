import type React from "react";
import { Fragment } from "react";
import { NavLink } from "react-router-dom";
import { dateTime } from "../../../utils/dateTime";
import Table from "../../Table";
import TableBottom from "../../TableBottom";
import MatchScore from "../../compete/MatchScore";
import MatchStatus from "../../compete/MatchStatus";
import RatingDelta from "../../compete/MatchRatingDelta";
import { useEpisodeInfo } from "api/episode/useEpisode";
import { useEpisodeId } from "contexts/EpisodeContext";
import { useUserTeam } from "api/team/useTeam";
import { isNil } from "lodash";
import { useUserScrimmageList } from "api/compete/useCompete";
import { useQueryClient } from "@tanstack/react-query";

interface ScrimHistoryTableProps {
  scrimsPage: number;
  handlePage: (page: number, key: "scrimsPage") => void;
}

const ScrimHistoryTable: React.FC<ScrimHistoryTableProps> = ({
  scrimsPage,
  handlePage,
}) => {
  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();
  const episodeData = useEpisodeInfo({ id: episodeId });
  const userTeamData = useUserTeam({ episodeId });
  const scrimsData = useUserScrimmageList(
    { episodeId, page: scrimsPage },
    queryClient,
  );

  return (
    <Fragment>
      <h1 className="mb-2 text-2xl font-bold leading-7 text-gray-900">
        Scrimmage History
      </h1>
      <Table
        data={scrimsData.data?.results ?? []}
        loading={scrimsData.isLoading}
        keyFromValue={(match) => match.id.toString()}
        bottomElement={
          <TableBottom
            totalCount={scrimsData.data?.count ?? 0}
            pageSize={10}
            currentPage={scrimsPage}
            onPage={(page) => {
              handlePage(page, "scrimsPage");
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
            header: "Rating (Δ)",
            key: "rating",
            value: (match) => {
              const userTeam = match.participants?.find(
                (p) => p.team === userTeamData.data?.id,
              );
              if (userTeam === undefined) return;
              return (
                <RatingDelta
                  includeTeamName={false}
                  participant={userTeam}
                  ranked={match.is_ranked}
                />
              );
            },
          },
          {
            header: "Opponent (Δ)",
            key: "opponent",
            value: (match) => {
              const opponent = match.participants?.find(
                (p) =>
                  userTeamData.isSuccess && p.team !== userTeamData.data.id,
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
              !episodeData.isSuccess || isNil(match.replay_url) ? (
                <></>
              ) : (
                <NavLink
                  className="text-cyan-600 hover:underline"
                  to={`https://releases.battlecode.org/client/${
                    episodeData.data.artifact_name ?? ""
                  }/${
                    episodeData.data.release_version_public ?? ""
                  }/index.html?gameSource=${match.replay_url}`}
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
    </Fragment>
  );
};

export default ScrimHistoryTable;
