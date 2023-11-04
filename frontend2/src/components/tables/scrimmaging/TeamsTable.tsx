import React from "react";
import { NavLink } from "react-router-dom";
import type { PaginatedTeamPublicList } from "../../../utils/types";
import type { Maybe } from "../../../utils/utilTypes";
import Table from "../../Table";
import TableBottom from "../../TableBottom";

interface TeamsTableProps {
  data: Maybe<PaginatedTeamPublicList>;
  page: number;
  loading: boolean;
  handlePage: (page: number) => void;
}

function trimString(str: string, maxLength: number): string {
  if (str.length > maxLength) {
    return str.slice(0, maxLength - 1) + "...";
  }
  return str;
}

const TeamsTable: React.FC<TeamsTableProps> = ({
  data,
  page,
  loading,
  handlePage,
}) => {
  return (
    <Table
      data={data?.results ?? []}
      loading={loading}
      keyFromValue={(team) => team.id.toString()}
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
          header: "Rating",
          key: "rating",
          value: (team) => Math.round(team.profile?.rating ?? 0),
        },
        {
          header: "Team",
          key: "team",
          value: (team) => (
            <NavLink to={`/team/${team.id}`} className="hover:underline">
              {trimString(team.name, 13)}
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
                  {trimString(member.username, 13)}
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
            team.profile?.auto_accept_unranked
              ? "Yes"
              : "No",
        },
        {
          header: "",
          key: "request",
          value: (team) => "REQUEST",
        },
      ]}
    />
  );
};

export default TeamsTable;
