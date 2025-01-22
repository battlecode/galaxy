import type React from "react";
import { Fragment, useState } from "react";
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
import ScrimmageAcceptRejectLabel from "components/ScrimmageAcceptRejectLabel";

interface TeamsTableProps {
  search: string;
  teamsPage: number;
  handlePage: (page: number, key: "teamsPage") => void;
  handleSearch: (search: string) => void;
}

const TeamsTable: React.FC<TeamsTableProps> = ({
  search,
  teamsPage,
  handlePage,
  handleSearch,
}) => {
  const { episodeId } = useEpisodeId();
  const episodeInfo = useEpisodeInfo({ id: episodeId });
  const queryClient = useQueryClient();
  const userTeam = useUserTeam({ episodeId });
  const teamsData = useSearchTeams(
    { episodeId, search, hasActiveSubmission: true, page: teamsPage },
    queryClient,
  );
  const maps = useEpisodeMaps({ episodeId });

  const [searchText, setSearchText] = useState<string>(search);
  const [teamToRequest, setTeamToRequest] = useState<TeamPublic | null>(null);

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
                {team.name}
              </NavLink>
            ),
          },
          {
            header: "Members",
            key: "members",
            value: (team) =>
              team.members.map((member, idx) => (
                <NavLink
                  key={member.id}
                  to={`/user/${member.id}`}
                  className="hover:underline"
                >
                  {member.username +
                    (idx !== team.members.length - 1 ? ", " : "")}
                </NavLink>
              )),
          },
          {
            header: "Quote",
            key: "quote",
            value: (team) => team.profile?.quote ?? "",
          },
          {
            header: "Ranked",
            key: "ranked_scrimmages",
            value: (team) => (
              <ScrimmageAcceptRejectLabel
                acceptRejectStatus={team.profile?.auto_accept_reject_ranked}
              />
            ),
          },
          {
            header: "Unranked",
            key: "unranked_scrimmages",
            value: (team) => (
              <ScrimmageAcceptRejectLabel
                acceptRejectStatus={team.profile?.auto_accept_reject_unranked}
              />
            ),
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
                  disabled={!episodeInfo.isSuccess || episodeInfo.data.frozen}
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
