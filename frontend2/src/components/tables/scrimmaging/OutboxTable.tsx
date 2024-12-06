import type React from "react";
import { Fragment } from "react";
import Table from "components/Table";
import {
  useCancelScrimmage,
  useScrimmageOutboxList,
} from "api/compete/useCompete";
import { useQueryClient } from "@tanstack/react-query";
import { useEpisodeId } from "contexts/EpisodeContext";
import TableBottom from "components/TableBottom";
import Button from "components/elements/Button";
import TeamWithRating from "components/compete/TeamWithRating";
import { stringifyPlayerOrder } from "utils/utilTypes";
import Pill from "components/elements/Pill";
import { dateTime } from "utils/dateTime";

interface OutboxTableProps {
  outboxPage: number;
  handlePage: (page: number, key: "outboxPage") => void;
}

const OutboxTable: React.FC<OutboxTableProps> = ({
  outboxPage,
  handlePage,
}) => {
  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();
  const outboxData = useScrimmageOutboxList(
    { episodeId, page: outboxPage },
    queryClient,
  );

  const cancel = useCancelScrimmage({ episodeId }, queryClient);

  return (
    <Fragment>
      <h1 className="mb-2 text-2xl font-bold leading-7 text-gray-900">
        Outgoing Scrimmage Requests
      </h1>
      <Table
        data={outboxData.data?.results ?? []}
        loading={outboxData.isLoading}
        keyFromValue={(req) => req.id.toString()}
        bottomElement={
          <TableBottom
            totalCount={outboxData.data?.count ?? 0}
            pageSize={10}
            currentPage={outboxPage}
            onPage={(page) => {
              handlePage(page, "outboxPage");
            }}
          />
        }
        columns={[
          {
            header: "Team",
            key: "requestee",
            value: (req) => (
              <TeamWithRating
                teamName={req.requested_to_name}
                teamId={req.requested_to}
                includeTeamName={true}
                rating={req.requested_to_rating}
              />
            ),
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
                  <Pill key={mapItem} text={mapItem} deletable={false} />
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
            key: "cancel",
            value: (req) => (
              <div className="flex w-1/2 flex-row justify-end">
                <Button
                  variant="danger-outline"
                  label="Cancel"
                  loading={cancel.variables?.id === req.id.toString()}
                  onClick={() => {
                    cancel.mutate({ episodeId, id: req.id.toString() });
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

export default OutboxTable;
