import React from "react";
import {
  type PaginatedSubmissionList,
  StatusBccEnum,
} from "../../../api/_autogen";
import { useEpisodeId } from "contexts/EpisodeContext";
import {
  useDownloadSubmission
} from "../../../api/compete/useCompete";
import type { Maybe } from "../../../utils/utilTypes";
import { NavLink } from "react-router-dom";
import { dateTime } from "../../../utils/dateTime";
import Table from "../../Table";
import TableBottom from "../../TableBottom";

const SubmissionStatusDisplays: Record<StatusBccEnum, string> = {
  [StatusBccEnum.New]: "Created",
  [StatusBccEnum.Que]: "Queued",
  [StatusBccEnum.Run]: "Running",
  [StatusBccEnum.Try]: "Will be retried",
  [StatusBccEnum.Ok]: "Success",
  [StatusBccEnum.Err]: "Failed",
  [StatusBccEnum.Can]: "Cancelled",
};

interface SubHistoryTableProps {
  data: Maybe<PaginatedSubmissionList>;
  loading: boolean;
  page: number;
  handlePage: (page: number) => void;
}



// TODO: should i pass episodeId down as a prop?
const SubHistoryTable: React.FC<SubHistoryTableProps> = ({
  data,
  loading,
  page,
  handlePage,
  // downloadSubmission,
}) => {
  const { episodeId } = useEpisodeId();
  const downloadSubmission = useDownloadSubmission({ episodeId });

  return (
    <Table
      data={data?.results ?? []}
      loading={loading}
      keyFromValue={(match) => match.id.toString()}
      bottomElement={
        <TableBottom
          currentPage={page}
          pageSize={10}
          onPage={(page) => {
            handlePage(page);
          }}
          totalCount={data?.count ?? 0}
        />
      }
      columns={[
        {
          header: "Submitted At",
          key: "submitted_at",
          value: (sub) => dateTime(sub.created).localFullString,
        },
        {
          header: "Status",
          key: "status",
          value: (sub) =>
            sub.status === "OK!"
              ? sub.accepted
                ? "Accepted"
                : "Rejected"
              : SubmissionStatusDisplays[sub.status],
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
        {
          header: "",
          key: "log",
          value: (sub) => (
            <NavLink
              className="text-cyan-600 hover:underline"
              to={URL.createObjectURL(
                new Blob([sub.logs], { type: "text/plain" }),
              )}
              target="_blank"
            >
              View log
            </NavLink>
          ),
        },
        {
          header: "",
          key: "download",
          value: (sub) => <button className="text-cyan-600 hover:underline"
            onClick={
              () => { downloadSubmission.mutate({ episodeId, id: sub.id.toString() }); }
            } > Download</button >,
        },
      ]}
    />
  );
};

export default SubHistoryTable;
