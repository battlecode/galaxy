import type React from "react";
import { Fragment } from "react";
import Table from "components/Table";
import {
  useAcceptScrimmage,
  useRejectScrimmage,
  useScrimmageInboxList,
} from "api/compete/useCompete";
import { useEpisodeId } from "contexts/EpisodeContext";
import { useQueryClient } from "@tanstack/react-query";
import TableBottom from "components/TableBottom";
import Button from "components/elements/Button";
import { dateTime } from "utils/dateTime";
import TeamWithRating from "components/compete/TeamWithRating";
import { stringifyPlayerOrder } from "utils/utilTypes";
import Pill from "components/elements/Pill";

interface InboxTableProps {
  inboxPage: number;
  handlePage: (page: number, key: "inboxPage") => void;
}

const InboxTable: React.FC<InboxTableProps> = ({ inboxPage, handlePage }) => {
  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();
  const inboxData = useScrimmageInboxList(
    { episodeId, page: inboxPage },
    queryClient,
  );

  const accept = useAcceptScrimmage({ episodeId }, queryClient);
  const reject = useRejectScrimmage({ episodeId }, queryClient);

  return (
    <Fragment>
      <h1 className="mb-2 text-2xl font-bold leading-7 text-gray-900">
        Incoming Scrimmage Requests
      </h1>
      <Table
        data={inboxData.data?.results ?? []}
        loading={inboxData.isLoading}
        keyFromValue={(req) => req.id.toString()}
        bottomElement={
          <TableBottom
            querySuccess={inboxData.isSuccess}
            totalCount={inboxData.data?.count ?? 0}
            pageSize={10}
            currentPage={inboxPage}
            onPage={(page) => {
              handlePage(page, "inboxPage");
            }}
          />
        }
        columns={[
          {
            header: "Team",
            key: "requestor",
            value: (req) => (
              <TeamWithRating
                teamName={req.requested_by_name}
                teamId={req.requested_by}
                includeTeamName={true}
                rating={req.requested_by_rating}
              />
            ),
          },
          {
            header: "Type",
            key: "type",
            value: (req) => (req.is_ranked ? "Ranked" : "Unranked"),
          },
          {
            header: "Player Order",
            key: "player_order",
            value: (req) => stringifyPlayerOrder(req.player_order),
          },
          {
            header: "Maps",
            key: "maps",
            value: (req) => (
              <div className="flex min-h-max w-full flex-row flex-wrap gap-2">
                {req.maps.map((mapItem) => (
                  <Pill key={mapItem} label={mapItem} deletable={false} />
                ))}
              </div>
            ),
          },
          {
            header: "Requested At",
            key: "requested_at",
            value: (req) => dateTime(req.created).localFullString,
          },
          {
            header: "",
            key: "accept_reject",
            value: (req) => (
              <div className="flex flex-row gap-2">
                <Button
                  variant="dark"
                  label="Accept"
                  loading={accept.variables?.id === req.id.toString()}
                  onClick={() => {
                    accept.mutate({ episodeId, id: req.id.toString() });
                  }}
                />
                <Button
                  variant="danger-outline"
                  label="Reject"
                  loading={reject.variables?.id === req.id.toString()}
                  onClick={() => {
                    reject.mutate({ episodeId, id: req.id.toString() });
                  }}
                />
              </div>
            ),
          },
        ]}
      />
    </Fragment>
  );
};

export default InboxTable;
