import React from "react";
import type { PaginatedScrimmageRequestList } from "../../../utils/types";
import type { Maybe } from "../../../utils/utilTypes";
import Table from "../../Table";

interface OutboxTableProps {
  data: Maybe<PaginatedScrimmageRequestList>;
  loading: boolean;
}

const OutboxTable: React.FC<OutboxTableProps> = ({ data, loading }) => {
  return (
    <Table
      data={data?.results ?? []}
      loading={loading}
      keyFromValue={(req) => req.id.toString()}
      columns={[
        {
          header: "Team",
          key: "requestee",
          value: (req) => req.requested_to_name,
        },
        {
          header: "",
          key: "cancel",
          value: (req) => "CANCEL",
        },
      ]}
    />
  );
};

export default OutboxTable;
