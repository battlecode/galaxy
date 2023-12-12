import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Input from "../components/elements/Input";
import Button from "../components/elements/Button";
import { useEpisodeId } from "../contexts/EpisodeContext";
import Collapse from "../components/elements/Collapse";
import InboxTable from "../components/tables/scrimmaging/InboxTable";
import OutboxTable from "../components/tables/scrimmaging/OutboxTable";
import { getParamEntries, parsePageParam } from "../utils/searchParamHelpers";
import TeamsTable from "../components/tables/scrimmaging/TeamsTable";
import TournamentMatchesTable from "../components/tables/scrimmaging/TournamentMatchesTable";
import ScrimHistoryTable from "../components/tables/scrimmaging/ScrimHistoryTable";
import {
  useScrimmageInboxList,
  useScrimmageOutboxList,
  useTournamentMatchList,
  useUserScrimmageList,
} from "../api/compete/useCompete";
import { useSearchTeams, useUserTeam } from "../api/team/useTeam";
import { useQueryClient } from "@tanstack/react-query";

interface QueryParams {
  inboxPage: number;
  outboxPage: number;
  teamsPage: number;
  scrimsPage: number;
  tourneyPage: number;
  search: string;
}

const Scrimmaging: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const queryClient = useQueryClient();

  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams: QueryParams = useMemo(() => {
    return {
      inboxPage: parsePageParam("inboxPage", searchParams),
      outboxPage: parsePageParam("outboxPage", searchParams),
      teamsPage: parsePageParam("teamsPage", searchParams),
      scrimsPage: parsePageParam("scrimsPage", searchParams),
      tourneyPage: parsePageParam("tourneyPage", searchParams),
      search: searchParams.get("search") ?? "",
    };
  }, [searchParams]);

  const teamData = useUserTeam({ episodeId });
  const { data: inboxData, isLoading: inboxLoading } = useScrimmageInboxList(
    {
      episodeId,
      page: queryParams.inboxPage,
    },
    queryClient,
  );
  const { data: outboxData, isLoading: outboxLoading } = useScrimmageOutboxList(
    {
      episodeId,
      page: queryParams.outboxPage,
    },
    queryClient,
  );
  const { data: teamsData, isLoading: teamsLoading } = useSearchTeams(
    {
      episodeId,
      search: queryParams.search,
      page: queryParams.teamsPage,
    },
    queryClient,
  );
  const { data: scrimsData, isLoading: scrimsLoading } = useUserScrimmageList(
    {
      episodeId,
      page: queryParams.scrimsPage,
    },
    queryClient,
  );
  const { data: tourneyData, isLoading: tourneyLoading } =
    useTournamentMatchList(
      {
        episodeId,
        teamId: teamData.data?.id,
        page: queryParams.tourneyPage,
      },
      queryClient,
    );

  const [searchText, setSearchText] = useState<string>(queryParams.search);

  function handleSearch(): void {
    if (!teamsLoading && searchText !== queryParams.search) {
      setSearchParams((prev) => ({
        ...getParamEntries(prev),
        teamsPage: "1",
        search: searchText,
      }));
    }
  }

  /**
   * Helper function to update the page number of the desired table.
   * This is done by updating the URL (search) params.
   */
  function handlePage(
    page: number,
    key: keyof Omit<QueryParams, "search">,
  ): void {
    setSearchParams((prev) => ({
      ...getParamEntries(prev),
      [key]: page.toString(),
    }));
  }

  return (
    <div className="flex h-full w-full flex-col overflow-auto p-6">
      <h1 className="mb-5 text-3xl font-bold leading-7 text-gray-900">
        Scrimmaging
      </h1>

      <Collapse title="Inbox">
        <InboxTable data={inboxData} loading={inboxLoading} />
      </Collapse>
      <div className="mb-8" />
      <Collapse title="Outbox">
        <OutboxTable data={outboxData} loading={outboxLoading} />
      </Collapse>
      <div className="mb-8" />

      <h1 className="text-2xl font-bold leading-7 text-gray-900">
        Find a team to scrimmage!
      </h1>
      <div className="justify-left mb-5 flex h-10 w-4/5 flex-row items-center">
        <Input
          disabled={teamsLoading}
          placeholder="Search for a team..."
          value={searchText}
          onChange={(ev) => {
            setSearchText(ev.target.value);
          }}
          onKeyDown={(ev) => {
            if (ev.key === "Enter" || ev.key === "NumpadEnter") {
              handleSearch();
            }
          }}
        />
        <div className="w-10" />
        <Button
          disabled={teamsLoading}
          label="Search!"
          variant="dark"
          onClick={() => {
            handleSearch();
          }}
        />
      </div>
      <div className="mb-8">
        <TeamsTable
          data={teamsData}
          loading={teamsLoading}
          page={queryParams.teamsPage}
          handlePage={(page) => {
            handlePage(page, "teamsPage");
          }}
        />
      </div>

      <h1 className="mb-2 text-2xl font-bold leading-7 text-gray-900">
        Scrimmage History
      </h1>
      <div className="mb-8">
        <ScrimHistoryTable
          data={scrimsData}
          loading={scrimsLoading}
          page={queryParams.scrimsPage}
          handlePage={(page) => {
            handlePage(page, "scrimsPage");
          }}
        />
      </div>

      <h1 className="mb-2 text-2xl font-bold leading-7 text-gray-900">
        Recent Tournament Matches
      </h1>
      <div className="mb-8">
        <TournamentMatchesTable
          data={tourneyData}
          loading={!teamData.isSuccess || tourneyLoading}
          page={queryParams.tourneyPage}
          handlePage={(page: number) => {
            handlePage(page, "tourneyPage");
          }}
        />
      </div>
    </div>
  );
};

export default Scrimmaging;
