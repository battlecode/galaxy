import React from "react";
import type { TournamentSubmission } from "../../../api/_autogen";
import type { Maybe } from "../../../utils/utilTypes";
import { NavLink } from "react-router-dom";
import { dateTime } from "../../../utils/dateTime";
import Table from "../../Table";

interface TourneySubTableProps {
  data: Maybe<TournamentSubmission[]>;
  loading: boolean;
}

const TourneySubTable: React.FC<TourneySubTableProps> = ({ data, loading }) => {
  return (
    <Table
      data={data ?? []}
      loading={loading}
      keyFromValue={(match) =>
        match.tournament.toString() + "match" + match.id.toString()
      }
      columns={[
        {
          header: "Tournament",
          key: "tournament",
          value: (sub) => sub.tournament,
        },
        {
          header: "Submitted At",
          key: "submitted_at",
          value: (sub) => dateTime(sub.created).localFullString,
        },
        {
          header: "Description",
          key: "description",
          value: (sub) => sub.description ?? "",
        },
        {
          header: "Package Name",
          key: "package",
          value: (sub) => sub._package,
        },
        {
          header: "Submitter",
          key: "submitter",
          value: (sub) => (
            <NavLink to={`/user/${sub.user}`} className="hover:underline">
              {sub.username}
            </NavLink>
          ),
        },
      ]}
    />
  );
};

export default TourneySubTable;
