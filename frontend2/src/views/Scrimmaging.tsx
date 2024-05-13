import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import InboxTable from "components/tables/scrimmaging/InboxTable";
import OutboxTable from "components/tables/scrimmaging/OutboxTable";
import { getParamEntries, parsePageParam } from "utils/searchParamHelpers";
import TeamsTable from "components/tables/scrimmaging/TeamsTable";
import ScrimHistoryTable from "components/tables/scrimmaging/ScrimHistoryTable";
import { Tab } from "@headlessui/react";
import TournamentMatchesTable from "components/tables/scrimmaging/TournamentMatchesTable";
import ScrimmagingRecord from "components/compete/ScrimmagingRecord";
import { useEpisodeId } from "contexts/EpisodeContext";
import { useUserTeam } from "api/team/useTeam";
import Spinner from "components/Spinner";

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
  const userTeam = useUserTeam({ episodeId });

  function classNames(...classes: string[]): string {
    return classes.filter(Boolean).join(" ");
  }

  const tabClassName = ({ selected }: { selected: boolean }): string => {
    return classNames(
      "w-full rounded-lg py-2.5 text-sm font-medium leading-5",
      "ring-white/60 ring-offset-2 ring-offset-cyan-400 focus:outline-none focus:ring-2",
      selected
        ? "bg-white text-cyan-700 shadow"
        : "text-cyan-100 hover:bg-white/[0.12] hover:text-white",
    );
  };

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

  function handleSearch(search: string): void {
    setSearchParams((prev) => ({
      ...getParamEntries(prev),
      teamsPage: "1",
      search,
    }));
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
      <h1 className="mb-2 text-3xl font-bold leading-7 text-gray-900">
        Scrimmaging
      </h1>

      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-cyan-600 p-1">
          <Tab className={tabClassName}>Inbox</Tab>
          <Tab className={tabClassName}>Outbox</Tab>
          <Tab className={tabClassName}>Find Teams</Tab>
          <Tab className={tabClassName}>Scrim History</Tab>
          <Tab className={tabClassName}>Record</Tab>
          <Tab className={tabClassName}>Tournament Matches</Tab>
        </Tab.List>
        <Tab.Panels className="mt-2">
          <Tab.Panel
            className={classNames(
              "rounded-xl bg-white p-3",
              "ring-white/60 ring-offset-2 ring-offset-cyan-400 focus:outline-none focus:ring-2",
            )}
          >
            <InboxTable
              inboxPage={queryParams.inboxPage}
              handlePage={handlePage}
            />
          </Tab.Panel>
          <Tab.Panel
            className={classNames(
              "rounded-xl bg-white p-3",
              "ring-white/60 ring-offset-2 ring-offset-cyan-400 focus:outline-none focus:ring-2",
            )}
          >
            <OutboxTable
              outboxPage={queryParams.outboxPage}
              handlePage={handlePage}
            />
          </Tab.Panel>
          <Tab.Panel
            className={classNames(
              "rounded-xl bg-white p-3",
              "ring-white/60 ring-offset-2 ring-offset-cyan-400 focus:outline-none focus:ring-2",
            )}
          >
            <TeamsTable
              search={queryParams.search}
              teamsPage={queryParams.teamsPage}
              handleSearch={handleSearch}
              handlePage={handlePage}
            />
          </Tab.Panel>
          <Tab.Panel
            className={classNames(
              "rounded-xl bg-white p-3",
              "ring-white/60 ring-offset-2 ring-offset-cyan-400 focus:outline-none focus:ring-2",
            )}
          >
            <ScrimHistoryTable
              scrimsPage={queryParams.scrimsPage}
              handlePage={handlePage}
            />
          </Tab.Panel>
          <Tab.Panel
            className={classNames(
              "rounded-xl bg-white p-10",
              "ring-white/60 ring-offset-2 ring-offset-cyan-400 focus:outline-none focus:ring-2",
            )}
          >
            <h1 className="mb-4 text-2xl font-bold leading-7 text-gray-900">
              Scrimmaging Record
            </h1>
            {!userTeam.isSuccess ? (
              <div className="flex flex-row items-center justify-center text-xl">
                Loading... <Spinner size="lg" />
              </div>
            ) : (
              <ScrimmagingRecord team={userTeam.data} />
            )}
          </Tab.Panel>
          <Tab.Panel
            className={classNames(
              "rounded-xl bg-white p-3",
              "ring-white/60 ring-offset-2 ring-offset-cyan-400 focus:outline-none focus:ring-2",
            )}
          >
            <TournamentMatchesTable
              tourneyPage={queryParams.tourneyPage}
              handlePage={handlePage}
            />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default Scrimmaging;
