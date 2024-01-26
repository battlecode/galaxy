import React from "react";
import type {
  EligibilityCriterion,
  PaginatedTeamPublicList,
} from "../../api/_autogen";
import type { Maybe } from "../../utils/utilTypes";
import Table from "../Table";
import TableBottom from "../TableBottom";
import { NavLink } from "react-router-dom";
import EligibilityIcon from "../EligibilityIcon";
import { isPresent } from "../../utils/utilTypes";

interface RankingsTableProps {
  data: Maybe<PaginatedTeamPublicList>;
  loading: boolean;
  page: number;
  eligibilityMap: Map<number, EligibilityCriterion>;
  handlePage: (page: number) => void;
}

function trimString(str: string, maxLength: number): string {
  if (str.length > maxLength) {
    return str.slice(0, maxLength - 1) + "...";
  }
  return str;
}

const RankingsTable: React.FC<RankingsTableProps> = ({
  data,
  loading,
  page,
  eligibilityMap,
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
          onPage={(page) => {
            handlePage(page);
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
            <NavLink to={`/team/${team.id}`} className="hover:underline">
              {team.name}
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
          header: "Eligibility",
          key: "eligibility",
          value: (team) => {
            const icons: EligibilityCriterion[] =
              team.profile?.eligible_for
                ?.map((el) => eligibilityMap.get(el))
                .filter(isPresent) ?? [];
            return (
              <div className="flex flex-row items-center gap-2">
                {icons.map((el) => (
                  <EligibilityIcon key={el.id} criterion={el} />
                ))}
              </div>
            );
          },
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
      ]}
    />
  );
};

export default RankingsTable;
