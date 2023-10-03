import React, { useEffect, useMemo, useState } from "react";
import type {
  PaginatedScrimmageRequestList,
  PaginatedMatchList,
  PaginatedTeamPublicList,
  TeamPublic,
  ScrimmageRequest,
} from "../utils/types/models";
import { NavLink, useSearchParams } from "react-router-dom";
import { searchTeams } from "../utils/api/team";
import {
  getScrimmagesByTeam,
  getTournamentMatches,
  getUserScrimmagesInbox,
  getUserScrimmagesOutbox,
} from "../utils/api/compete";
import Input from "../components/elements/Input";
import Button from "../components/elements/Button";
import BattlecodeTable from "../components/BattlecodeTable";
import BattlecodeTableBottomElement from "../components/BattlecodeTableBottomElement";
import MatchScore from "../components/compete/MatchScore";
import RatingDelta from "../components/compete/RatingDelta";
import MatchStatus from "../components/compete/MatchStatus";
import { useEpisodeId } from "../contexts/EpisodeContext";
import { useCurrentTeam } from "../contexts/CurrentTeamContext";
import { dateTime } from "../components/compete/DateTime";
import Collapse from "../components/elements/Collapse";

function trimString(str: string, maxLength: number): string {
  if (str.length > maxLength) {
    return str.slice(0, maxLength - 1) + "...";
  }
  return str;
}

const Scrimmaging: React.FC = () => {
  const episodeId = useEpisodeId().episodeId;
  const currentTeam = useCurrentTeam().team;

  const [searchParams, setSearchParams] = useSearchParams();
  const getParamEntries = (prev: URLSearchParams): Record<string, string> => {
    return Object.fromEntries(prev.entries());
  };

  interface QueryParams {
    inboxPage: number;
    outboxPage: number;
    teamsPage: number;
    scrimsPage: number;
    tourneyPage: number;
    search: string;
  }

  const queryParams: QueryParams = useMemo(() => {
    return {
      inboxPage: parseInt(searchParams.get("inboxPage") ?? "1"),
      outboxPage: parseInt(searchParams.get("outboxPage") ?? "1"),
      teamsPage: parseInt(searchParams.get("teamsPage") ?? "1"),
      scrimsPage: parseInt(searchParams.get("scrimsPage") ?? "1"),
      tourneyPage: parseInt(searchParams.get("tourneyPage") ?? "1"),
      search: searchParams.get("search") ?? "",
    };
  }, [searchParams]);

  const [inboxLoading, setInboxLoading] = useState<boolean>(false);
  const [outboxLoading, setOutboxLoading] = useState<boolean>(false);

  const [searchText, setSearchText] = useState<string>(queryParams.search);
  const [teamsLoading, setTeamsLoading] = useState<boolean>(false);
  const [scrimsLoading, setScrimsLoading] = useState<boolean>(false);
  const [tourneyLoading, setTourneyLoading] = useState<boolean>(false);

  const [inboxData, setInboxData] = useState<
    PaginatedScrimmageRequestList | undefined
  >(undefined);
  const [outboxData, setOutboxData] = useState<
    PaginatedScrimmageRequestList | undefined
  >(undefined);
  const [teamsData, setTeamsData] = useState<
    PaginatedTeamPublicList | undefined
  >(undefined);
  const [scrimsData, setScrimsData] = useState<PaginatedMatchList | undefined>(
    undefined,
  );
  const [tourneyData, setTourneyData] = useState<
    PaginatedMatchList | undefined
  >(undefined);

  function handleSearch(): void {
    if (!teamsLoading && searchText !== queryParams.search) {
      setSearchParams((prev) => ({
        ...getParamEntries(prev),
        teamsPage: "1",
        search: searchText,
      }));
    }
  }

  async function fetchInbox(): Promise<void> {
    setInboxLoading(true);
    setInboxData((prev) => ({ count: prev?.count ?? 0 }));
    try {
      const result = await getUserScrimmagesInbox(
        episodeId,
        queryParams.inboxPage,
      );
      setInboxData(result);
    } catch (err) {
      setInboxData(undefined);
      console.error(err);
    } finally {
      setInboxLoading(false);
    }
  }

  async function fetchOutbox(): Promise<void> {
    setOutboxLoading(true);
    setOutboxData((prev) => ({ count: prev?.count ?? 0 }));
    try {
      const result = await getUserScrimmagesOutbox(
        episodeId,
        queryParams.outboxPage,
      );
      setOutboxData(result);
    } catch (err) {
      setOutboxData(undefined);
      console.error(err);
    } finally {
      setOutboxLoading(false);
    }
  }

  async function fetchTeamsData(): Promise<void> {
    setTeamsLoading(true);
    setTeamsData((prev) => ({ count: prev?.count ?? 0 }));
    try {
      const result = await searchTeams(
        episodeId,
        queryParams.search,
        true,
        queryParams.teamsPage,
      );
      setTeamsData(result);
    } catch (err) {
      setTeamsData(undefined);
      console.error(err);
    } finally {
      setTeamsLoading(false);
    }
  }

  async function fetchScrimsData(): Promise<void> {
    setScrimsLoading(true);
    setScrimsData((prev) => ({ count: prev?.count ?? 0 }));
    try {
      const scrimsResult = await getScrimmagesByTeam(
        episodeId,
        undefined,
        queryParams.teamsPage,
      );
      setScrimsData(scrimsResult);
    } catch (err) {
      setScrimsData(undefined);
      console.error(err);
    } finally {
      setScrimsLoading(false);
    }
  }

  async function fetchTourneyData(): Promise<void> {
    setTourneyLoading(true);
    setTourneyData((prev) => ({ count: prev?.count ?? 0 }));
    try {
      const result = await getTournamentMatches(
        episodeId,
        undefined,
        undefined,
        undefined,
        queryParams.tourneyPage,
      );
      setTourneyData(result);
    } catch (err) {
      setTourneyData(undefined);
      console.error(err);
    } finally {
      setTourneyLoading(false);
    }
  }

  useEffect(() => {
    if (!inboxLoading) {
      void fetchInbox();
    }
  }, [queryParams.inboxPage]);

  useEffect(() => {
    if (!outboxLoading) {
      void fetchOutbox();
    }
    return () => {
      setOutboxLoading(false);
    };
  }, [queryParams.outboxPage]);

  useEffect(() => {
    if (!teamsLoading) {
      void fetchTeamsData();
    }
  }, [queryParams.search, queryParams.teamsPage]);

  useEffect(() => {
    if (!scrimsLoading) {
      void fetchScrimsData();
    }
  }, [queryParams.scrimsPage]);

  useEffect(() => {
    if (!tourneyLoading) {
      void fetchTourneyData();
    }
  }, [queryParams.tourneyPage]);

  return (
    <div className="flex h-full w-full flex-col overflow-auto p-6">
      <h1 className="mb-5 text-3xl font-bold leading-7 text-gray-900">
        Scrimmaging
      </h1>

      <Collapse title="Inbox">
        <BattlecodeTable
          data={inboxData?.results ?? []}
          loading={inboxLoading}
          columns={[
            {
              header: "Team",
              value: (req) => req.requested_by_name,
            },
            {
              header: "",
              value: (req) => "ACCEPT",
            },
            {
              header: "",
              value: (req) => "REJECT",
            },
          ]}
        />
      </Collapse>
      <div className="mb-8" />
      <Collapse title="Outbox">
        <BattlecodeTable
          data={outboxData?.results ?? []}
          loading={outboxLoading}
          columns={[
            {
              header: "Team",
              value: (req) => req.requested_to_name,
            },
            {
              header: "",
              value: (req) => "CANCEL",
            },
          ]}
        />
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
        <BattlecodeTable
          data={teamsData?.results ?? []}
          loading={teamsLoading}
          columns={[
            {
              header: "Rating",
              value: (team) => Math.round(team.profile?.rating ?? 0),
            },
            {
              header: "Team",
              value: (team) => (
                <NavLink to={`/team/${team.id}`} className="hover:underline">
                  {trimString(team.name, 13)}
                </NavLink>
              ),
            },
            {
              header: "Members",
              value: (team) =>
                team.members.map((member, idx) => (
                  <>
                    <NavLink
                      key={idx}
                      to={`/user/${member.id}`}
                      className="hover:underline"
                    >
                      {trimString(member.username, 13)}
                    </NavLink>
                    {idx !== team.members.length - 1 ? ", " : ""}
                  </>
                )),
            },
            {
              header: "Quote",
              value: (team) => team.profile?.quote ?? "",
            },
            {
              header: "Auto-Accept Ranked",
              value: (team) =>
                team.profile?.auto_accept_ranked !== undefined &&
                team.profile.auto_accept_ranked
                  ? "Yes"
                  : "No",
            },
            {
              header: "Auto-Accept Unranked",
              value: (team) =>
                team.profile?.auto_accept_unranked !== undefined &&
                team.profile?.auto_accept_unranked
                  ? "Yes"
                  : "No",
            },
            {
              header: "",
              value: (team) => "TODO",
            },
          ]}
          bottomElement={
            <BattlecodeTableBottomElement
              totalCount={teamsData?.count ?? 0}
              pageSize={10}
              currentPage={queryParams.teamsPage}
              onPage={(page) => {
                if (!teamsLoading) {
                  setSearchParams((prev) => ({
                    ...getParamEntries(prev),
                    teamsPage: page.toString(),
                  }));
                }
              }}
            />
          }
        />
      </div>

      <div className="justify-right mb-1 flex flex-row space-x-4">
        <h1 className="mb-2 text-2xl font-bold leading-7 text-gray-900">
          Scrimmage History
        </h1>
        <Button
          disabled={scrimsLoading}
          label="Refresh!"
          variant="dark"
          onClick={() => {
            if (queryParams.scrimsPage === 1 && !scrimsLoading) {
              void fetchScrimsData();
              return;
            }
            setSearchParams((prev) => ({
              ...getParamEntries(prev),
              scrimsPage: "1",
            }));
          }}
        />
      </div>
      <div className="mb-8">
        <BattlecodeTable
          data={scrimsData?.results ?? []}
          loading={scrimsLoading}
          columns={[
            {
              header: "Score",
              value: (match) => {
                return (
                  <MatchScore match={match} userTeamId={currentTeam?.id} />
                );
              },
            },
            {
              header: "Opponent (Δ)",
              value: (match) => {
                const opponent = match.participants?.find(
                  (p) => currentTeam !== undefined && p.team !== currentTeam.id,
                );
                if (opponent === undefined) return;
                return (
                  <RatingDelta
                    participant={opponent}
                    ranked={match.is_ranked}
                  />
                );
              },
            },
            {
              header: "Ranked",
              value: (match) => (match.is_ranked ? "Ranked" : "Unranked"),
            },
            {
              header: "Status",
              value: (match) => <MatchStatus match={match} />,
            },
            {
              header: "Replay",
              value: (match) => "TODO",
            },
            {
              header: "Created",
              value: (match) => dateTime(match.created).localFullString,
            },
          ]}
          bottomElement={
            <BattlecodeTableBottomElement
              totalCount={scrimsData?.count ?? 0}
              pageSize={10}
              currentPage={queryParams.scrimsPage}
              onPage={(page) => {
                if (!scrimsLoading) {
                  setSearchParams((prev) => ({
                    ...getParamEntries(prev),
                    scrimsPage: page.toString(),
                  }));
                }
              }}
            />
          }
        />
      </div>

      <div className="justify-right mb-1 flex flex-row space-x-4">
        <h1 className="mb-2 text-2xl font-bold leading-7 text-gray-900">
          Recent Tournament Matches
        </h1>
        <Button
          disabled={tourneyLoading}
          label="Refresh!"
          variant="dark"
          onClick={() => {
            if (queryParams.tourneyPage === 1 && !tourneyLoading) {
              void fetchTourneyData();
              return;
            }
            setSearchParams((prev) => ({
              ...getParamEntries(prev),
              tourneyPage: "1",
            }));
          }}
        />
      </div>

      <div className="mb-8">
        <BattlecodeTable
          data={tourneyData?.results ?? []}
          loading={tourneyLoading}
          columns={[
            {
              header: "Score",
              value: (match) => (
                <MatchScore match={match} userTeamId={currentTeam?.id} />
              ),
            },
            {
              header: "Opponent",
              value: (match) => {
                const opponent = match.participants?.find(
                  (p) => currentTeam !== undefined && p.team !== currentTeam.id,
                );
                if (opponent === undefined) return;
                return (
                  <RatingDelta
                    participant={opponent}
                    ranked={match.is_ranked}
                  />
                );
              },
            },
            {
              header: "Status",
              value: (match) => <MatchStatus match={match} />,
            },
            {
              header: "Replay",
              value: (match) => "TODO",
            },
            {
              header: "Created",
              value: (match) => dateTime(match.created).localFullString,
            },
          ]}
          bottomElement={
            <BattlecodeTableBottomElement
              totalCount={tourneyData?.count ?? 0}
              pageSize={10}
              currentPage={queryParams.tourneyPage}
              onPage={(page) => {
                if (!tourneyLoading) {
                  setSearchParams((prev) => ({
                    ...getParamEntries(prev),
                    tourneyPage: page.toString(),
                  }));
                }
              }}
            />
          }
        />
      </div>
    </div>
  );
};

const RequestScrimmageButton: React.FC<{ team: TeamPublic }> = ({ team }) => {
  return <>TODO</>;
};

const AcceptRejectScrimmageButton: React.FC<{
  scrimRequest: ScrimmageRequest;
}> = ({ scrimRequest }) => {
  return <>TODO</>;
};

export default Scrimmaging;
