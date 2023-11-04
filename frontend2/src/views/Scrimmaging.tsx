import React, { useEffect, useMemo, useState } from "react";
import type {
  PaginatedScrimmageRequestList,
  PaginatedMatchList,
  PaginatedTeamPublicList,
} from "../utils/types/models";
import { useSearchParams } from "react-router-dom";
import { searchTeams } from "../utils/api/team";
import {
  getScrimmagesByTeam,
  getTournamentMatches,
  getUserScrimmagesInbox,
  getUserScrimmagesOutbox,
} from "../utils/api/compete";
import Input from "../components/elements/Input";
import Button from "../components/elements/Button";
import { useEpisodeId } from "../contexts/EpisodeContext";
import Collapse from "../components/elements/Collapse";
import type { Maybe } from "../utils/utilTypes";
import InboxTable from "../components/tables/scrimmaging/InboxTable";
import OutboxTable from "../components/tables/scrimmaging/OutboxTable";
import { getParamEntries, parsePageParam } from "../utils/searchParamHelpers";
import TeamsTable from "../components/tables/scrimmaging/TeamsTable";
import TournamentMatchesTable from "../components/tables/scrimmaging/TournamentMatchesTable";
import ScrimHistoryTable from "../components/tables/scrimmaging/ScrimHistoryTable";

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

  const [inboxLoading, setInboxLoading] = useState<boolean>(false);
  const [outboxLoading, setOutboxLoading] = useState<boolean>(false);

  const [searchText, setSearchText] = useState<string>(queryParams.search);
  const [teamsLoading, setTeamsLoading] = useState<boolean>(false);
  const [scrimsLoading, setScrimsLoading] = useState<boolean>(false);
  const [tourneyLoading, setTourneyLoading] = useState<boolean>(false);

  const [inboxData, setInboxData] =
    useState<Maybe<PaginatedScrimmageRequestList>>();
  const [outboxData, setOutboxData] =
    useState<Maybe<PaginatedScrimmageRequestList>>();
  const [teamsData, setTeamsData] = useState<Maybe<PaginatedTeamPublicList>>();
  const [scrimsData, setScrimsData] = useState<Maybe<PaginatedMatchList>>();
  const [tourneyData, setTourneyData] = useState<Maybe<PaginatedMatchList>>();

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

  useEffect(() => {
    let isActiveLookup = true;
    if (inboxLoading) return;
    setInboxLoading(true);
    setInboxData((prev) => ({ count: prev?.count ?? 0 }));

    const fetchInbox = async (): Promise<void> => {
      try {
        const result = await getUserScrimmagesInbox(
          episodeId,
          queryParams.inboxPage,
        );
        if (isActiveLookup) {
          setInboxData(result);
        }
      } catch (err) {
        if (isActiveLookup) {
          setInboxData(undefined);
        }
        console.error(err);
      } finally {
        if (isActiveLookup) {
          setInboxLoading(false);
        }
      }
    };

    void fetchInbox();

    return () => {
      isActiveLookup = false;
    };
  }, [episodeId, queryParams.inboxPage]);

  useEffect(() => {
    let isActiveLookup = true;
    if (outboxLoading) return;
    setOutboxLoading(true);
    setOutboxData((prev) => ({ count: prev?.count ?? 0 }));

    const fetchOutbox = async (): Promise<void> => {
      try {
        const result = await getUserScrimmagesOutbox(
          episodeId,
          queryParams.outboxPage,
        );
        if (isActiveLookup) {
          setOutboxData(result);
        }
      } catch (err) {
        if (isActiveLookup) {
          setOutboxData(undefined);
        }
        console.error(err);
      } finally {
        if (isActiveLookup) {
          setOutboxLoading(false);
        }
      }
    };

    void fetchOutbox();

    return () => {
      isActiveLookup = false;
    };
  }, [episodeId, queryParams.outboxPage]);

  useEffect(() => {
    let isActiveLookup = true;
    if (teamsLoading) return;
    setTeamsLoading(true);
    setTeamsData((prev) => ({ count: prev?.count ?? 0 }));

    const fetchTeams = async (): Promise<void> => {
      try {
        const result = await searchTeams(
          episodeId,
          queryParams.search,
          true,
          queryParams.teamsPage,
        );
        if (isActiveLookup) {
          setTeamsData(result);
        }
      } catch (err) {
        if (isActiveLookup) {
          setTeamsData(undefined);
        }
        console.error(err);
      } finally {
        if (isActiveLookup) {
          setTeamsLoading(false);
        }
      }
    };

    void fetchTeams();

    return () => {
      isActiveLookup = false;
    };
  }, [episodeId, queryParams.search, queryParams.teamsPage]);

  useEffect(() => {
    let isActiveLookup = true;
    if (scrimsLoading) return;
    setScrimsLoading(true);
    setScrimsData((prev) => ({ count: prev?.count ?? 0 }));

    const fetchScrims = async (): Promise<void> => {
      try {
        const result = await getScrimmagesByTeam(
          episodeId,
          undefined,
          queryParams.scrimsPage,
        );
        if (isActiveLookup) {
          setScrimsData(result);
        }
      } catch (err) {
        if (isActiveLookup) {
          setScrimsData(undefined);
        }
        console.error(err);
      } finally {
        if (isActiveLookup) {
          setScrimsLoading(false);
        }
      }
    };

    void fetchScrims();

    return () => {
      isActiveLookup = false;
    };
  }, [episodeId, queryParams.scrimsPage]);

  useEffect(() => {
    let isActiveLookup = true;
    if (tourneyLoading) return;
    setTourneyLoading(true);
    setTourneyData((prev) => ({ count: prev?.count ?? 0 }));

    const fetchTourney = async (): Promise<void> => {
      try {
        const result = await getTournamentMatches(
          episodeId,
          undefined,
          undefined,
          undefined,
          queryParams.tourneyPage,
        );
        if (isActiveLookup) {
          setTourneyData(result);
        }
      } catch (err) {
        if (isActiveLookup) {
          setTourneyData(undefined);
        }
        console.error(err);
      } finally {
        if (isActiveLookup) {
          setTourneyLoading(false);
        }
      }
    };

    void fetchTourney();

    return () => {
      isActiveLookup = false;
    };
  }, [queryParams.tourneyPage]);

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
          loading={tourneyLoading}
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
