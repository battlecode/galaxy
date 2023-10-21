import React, { useEffect, useMemo, useState } from "react";
import type {
  PaginatedScrimmageRequestList,
  PaginatedMatchList,
  PaginatedTeamPublicList,
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
import { useEpisode, useEpisodeId } from "../contexts/EpisodeContext";
import { useCurrentTeam } from "../contexts/CurrentTeamContext";
import { dateTime } from "../utils/dateTime";
import Collapse from "../components/elements/Collapse";
import type { Maybe } from "../utils/utilTypes";

function trimString(str: string, maxLength: number): string {
  if (str.length > maxLength) {
    return str.slice(0, maxLength - 1) + "...";
  }
  return str;
}

interface QueryParams {
  inboxPage: number;
  outboxPage: number;
  teamsPage: number;
  scrimsPage: number;
  tourneyPage: number;
  search: string;
}

const getParamEntries = (prev: URLSearchParams): Record<string, string> => {
  return Object.fromEntries(prev);
};

const Scrimmaging: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const episode = useEpisode();
  const { team: currentTeam } = useCurrentTeam();

  const [searchParams, setSearchParams] = useSearchParams();

  const parsePageParam = (paramName: string): number =>
    parseInt(searchParams.get(paramName) ?? "1");

  const queryParams: QueryParams = useMemo(() => {
    return {
      inboxPage: parsePageParam("inboxPage"),
      outboxPage: parsePageParam("outboxPage"),
      teamsPage: parsePageParam("teamsPage"),
      scrimsPage: parsePageParam("scrimsPage"),
      tourneyPage: parsePageParam("tourneyPage"),
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
              value: (team) => "REQUEST",
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

      <h1 className="mb-2 text-2xl font-bold leading-7 text-gray-900">
        Scrimmage History
      </h1>
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
              value: (match) =>
                episode === undefined ? (
                  <></>
                ) : (
                  <NavLink
                    className="text-cyan-600 hover:underline"
                    to={`https://releases.battlecode.org/client/${
                      episode.artifact_name ?? ""
                    }/${episode.release_version_public ?? ""}/visualizer.html?${
                      match.replay_url
                    }`}
                  >
                    Replay!
                  </NavLink>
                ),
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

      <h1 className="mb-2 text-2xl font-bold leading-7 text-gray-900">
        Recent Tournament Matches
      </h1>
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
              value: (match) =>
                episode === undefined ? (
                  <></>
                ) : (
                  <NavLink
                    className="text-cyan-600 hover:underline"
                    to={`https://releases.battlecode.org/client/${
                      episode.artifact_name ?? ""
                    }/${episode.release_version_public ?? ""}/visualizer.html?${
                      match.replay_url
                    }`}
                  >
                    Replay!
                  </NavLink>
                ),
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

export default Scrimmaging;
