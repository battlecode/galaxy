import type React from "react";
import { Fragment, useCallback, useState } from "react";
import { NavLink } from "react-router-dom";
import Table from "components/Table";
import TableBottom from "components/TableBottom";
import { useQueryClient } from "@tanstack/react-query";
import { useEpisodeId } from "contexts/EpisodeContext";
import { useSearchTeams, useUserTeam } from "api/team/useTeam";
import Input from "components/elements/Input";
import Button from "components/elements/Button";
import type { TeamPublic } from "api/_autogen";
import RequestScrimModal from "./RequestScrimModal";
import { useEpisodeInfo, useEpisodeMaps } from "api/episode/useEpisode";

interface TeamsTableProps {
  search: string;
  teamsPage: number;
  handlePage: (page: number, key: "teamsPage") => void;
  handleSearch: (search: string) => void;
}

function trimString(str: string, maxLength: number): string {
  if (str.length > maxLength) {
    return str.slice(0, maxLength - 1) + "...";
  }
  return str;
}

const TeamsTable: React.FC<TeamsTableProps> = ({
  search,
  teamsPage,
  handlePage,
  handleSearch,
}) => {
  const MAX_NAME_LENGTH = 13;

  const { episodeId } = useEpisodeId();
  const episodeInfo = useEpisodeInfo({ id: episodeId });
  const queryClient = useQueryClient();
  const userTeam = useUserTeam({ episodeId });
  const teamsData = useSearchTeams(
    { episodeId, search, page: teamsPage },
    queryClient,
  );
  const maps = useEpisodeMaps({ episodeId });

  const [searchText, setSearchText] = useState<string>(search);
  const [teamToRequest, setTeamToRequest] = useState<TeamPublic | null>(null);

  const canRequestScrimmage: (team: TeamPublic) => boolean = useCallback(
    (team) => {
      // TODO: Hack -> has_active_submission should be a boolean! Some sort of bug in API generation.
      const hasActiveSubmission =
        typeof team.has_active_submission === "boolean"
          ? team.has_active_submission
          : team.has_active_submission === "true";
      return (
        userTeam.isSuccess &&
        episodeInfo.isSuccess &&
        !episodeInfo.data.frozen &&
        userTeam.data.id !== team.id &&
        hasActiveSubmission &&
        team.members.length > 0
      );
    },
    [userTeam],
  );

  return (
    <Fragment>
      <h1 className="text-2xl font-bold leading-7 text-gray-900">
        Find a team to scrimmage!
      </h1>
      <div className="mb-4 flex flex-row gap-4">
        <Input
          disabled={teamsData.isLoading}
          placeholder="Search for a team..."
          value={searchText}
          onChange={(ev) => {
            setSearchText(ev.target.value);
          }}
          onKeyDown={(ev) => {
            if (
              (ev.key === "Enter" || ev.key === "NumpadEnter") &&
              search !== searchText &&
              !teamsData.isLoading
            ) {
              handleSearch(searchText);
            }
          }}
        />
        <Button
          disabled={teamsData.isLoading}
          label="Search!"
          variant="dark"
          onClick={() => {
            if (search !== searchText && !teamsData.isLoading) {
              handleSearch(searchText);
            }
          }}
        />
      </div>
      <Table
        data={teamsData.data?.results ?? []}
        loading={teamsData.isLoading}
        keyFromValue={(team) => team.id.toString()}
        bottomElement={
          <TableBottom
            querySuccess={teamsData.isSuccess}
            totalCount={teamsData.data?.count ?? 0}
            pageSize={10}
            currentPage={teamsPage}
            onPage={(page) => {
              handlePage(page, "teamsPage");
            }}
          />
        }
        columns={[
          {
            header: "Rating",
            key: "rating",
            value: (team) => Math.round(team.profile?.rating ?? 0),
          },
          {
            header: "Team",
            key: "team",
            value: (team) => (
              <NavLink
                to={`/${episodeId}/team/${team.id}`}
                className="hover:underline"
              >
                {trimString(team.name, MAX_NAME_LENGTH)}
              </NavLink>
            ),
          },
          {
            header: "Members",
            key: "members",
            value: (team) =>
              team.members.map((member, idx) => (
                <>
                  <NavLink
                    key={idx}
                    to={`/user/${member.id}`}
                    className="hover:underline"
                  >
                    {trimString(member.username, MAX_NAME_LENGTH)}
                  </NavLink>
                  {idx !== team.members.length - 1 ? ", " : ""}
                </>
              )),
          },
          {
            header: "Quote",
            key: "quote",
            value: (team) => team.profile?.quote ?? "",
          },
          {
            header: "Auto-Accept Ranked",
            key: "auto_accept_ranked",
            value: (team) =>
              team.profile?.auto_accept_ranked !== undefined &&
              team.profile.auto_accept_ranked
                ? "Yes"
                : "No",
          },
          {
            header: "Auto-Accept Unranked",
            key: "auto_accept_unranked",
            value: (team) =>
              team.profile?.auto_accept_unranked !== undefined &&
              team.profile.auto_accept_unranked
                ? "Yes"
                : "No",
          },
          {
            header: "",
            key: "request",
            value: (team) =>
              userTeam.isSuccess &&
              team.id !== userTeam.data.id && (
                <Button
                  label="Request"
                  variant="dark"
                  loading={maps.isLoading && teamToRequest?.id === team.id}
                  disabled={!canRequestScrimmage(team)}
                  onClick={() => {
                    setTeamToRequest(team);
                  }}
                />
              ),
          },
        ]}
      />
      {teamToRequest !== null && maps.isSuccess && (
        <RequestScrimModal
          isOpen
          teamToRequest={teamToRequest}
          maps={maps.data}
          closeModal={() => {
            setTeamToRequest(null);
          }}
        />
      )}
    </Fragment>
  );
};

export default TeamsTable;
