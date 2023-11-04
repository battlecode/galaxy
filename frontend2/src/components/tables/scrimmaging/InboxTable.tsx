import React from "react";
import type { PaginatedScrimmageRequestList } from "../../../utils/types";
import type { Maybe } from "../../../utils/utilTypes";
import Table from "../../Table";

interface InboxTableProps {
  data: Maybe<PaginatedScrimmageRequestList>;
  loading: boolean;
}

const InboxTable: React.FC<InboxTableProps> = ({ data, loading }) => {
  return (
    <Table
      data={data?.results ?? []}
      loading={loading}
      keyFromValue={(req) => req.id.toString()}
      columns={[
        {
          header: "Team",
          key: "requestor",
          value: (req) => req.requested_by_name,
        },
        {
          header: "",
          key: "accept",
          value: (req) => "ACCEPT",
        },
        {
          header: "",
          key: "reject",
          value: (req) => "REJECT",
        },
      ]}
    />
  );
};

export default InboxTable;
