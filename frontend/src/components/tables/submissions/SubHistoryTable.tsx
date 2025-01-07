import type React from "react";
import { StatusBccEnum } from "../../../api/_autogen";
import { useEpisodeId } from "contexts/EpisodeContext";
import {
  useDownloadSubmission,
  useSubmissionsList,
} from "../../../api/compete/useCompete";
import { NavLink } from "react-router-dom";
import { dateTime } from "../../../utils/dateTime";
import Table from "../../Table";
import TableBottom from "../../TableBottom";
import Button from "components/elements/Button";
import { useQueryClient } from "@tanstack/react-query";

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
  page: number;
  handlePage: (page: number) => void;
}

const SubHistoryTable: React.FC<SubHistoryTableProps> = ({
  page,
  handlePage,
}) => {
  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();

  const submissions = useSubmissionsList({ episodeId, page }, queryClient);

  const downloadSubmission = useDownloadSubmission({ episodeId });

  return (
    <Table
      data={submissions.data?.results ?? []}
      loading={submissions.isLoading}
      keyFromValue={(sub) => sub.id.toString()}
      bottomElement={
        <TableBottom
          querySuccess={submissions.isSuccess}
          currentPage={page}
          pageSize={10}
          onPage={(page) => {
            handlePage(page);
          }}
          totalCount={submissions.data?.count ?? 0}
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
            sub.status === StatusBccEnum.Ok
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
          value: (sub) => (
            <Button
              variant="dark"
              onClick={() => {
                downloadSubmission.mutate({ episodeId, id: sub.id.toString() });
              }}
              label="Download"
            />
          ),
        },
      ]}
    />
  );
};

export default SubHistoryTable;
