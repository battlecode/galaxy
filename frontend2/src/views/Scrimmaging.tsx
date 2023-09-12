import React, { useEffect, useState } from "react";
import { useEpisodeId } from "../contexts/EpisodeContext";
import type {
  PaginatedMatchList,
  PaginatedTeamPublicList,
} from "../utils/types/models";
import { NavLink, useSearchParams } from "react-router-dom";
import { searchTeams } from "../utils/api/team";
import {
  getScrimmagesByTeam,
  getTournamentMatches,
} from "../utils/api/compete";
import Input from "../components/elements/Input";
import Button from "../components/elements/Button";
import BattlecodeTable from "../components/BattlecodeTable";
import BattlecodeTableBottomElement from "../components/BattlecodeTableBottomElement";
import MyMatchResult from "../components/compete/MyMatchResult";

function trimString(str: string, maxLength: number): string {
  if (str.length > maxLength) {
    return str.slice(0, maxLength - 1) + "...";
  }
  return str;
}

const Scrimmaging: React.FC = () => {
  const episodeId = useEpisodeId().episodeId;

  const [searchText, setSearchText] = useState<string>("");
  const [teamsLoading, setTeamsLoading] = useState<boolean>(false);
  const [scrimsLoading, setScrimsLoading] = useState<boolean>(false);
  const [tourneyLoading, setTourneyLoading] = useState<boolean>(false);
  const [teamsData, setTeamsData] = useState<
    PaginatedTeamPublicList | undefined
  >(undefined);
  const [scrimsData, setScrimsData] = useState<PaginatedMatchList | undefined>(
    undefined,
  );
  const [tourneyData, setTourneyData] = useState<
    PaginatedMatchList | undefined
  >(undefined);

  const [queryParams, setQueryParams] = useSearchParams({
    teamsPage: "1",
    scrimsPage: "1",
    tourneyPage: "1",
    search: "",
  });
  const teamsPage = parseInt(queryParams.get("teamsPage") ?? "1");
  const scrimsPage = parseInt(queryParams.get("scrimsPage") ?? "1");
  const tourneyPage = parseInt(queryParams.get("tourneyPage") ?? "1");
  const searchQuery = queryParams.get("search") ?? "";

  // function handlePage(page: number): void {
  //   if (!loading) {
  //     setQueryParams({ ...queryParams, page: page.toString() });
  //   }
  // }

  function handleSearch(): void {
    if (!teamsLoading && searchText !== searchQuery) {
      setQueryParams({ ...queryParams, search: searchText });
    }
  }

  async function fetchTeamsData(): Promise<void> {
    setTeamsLoading(true);
    setTeamsData((prev) => ({ count: prev?.count ?? 0 }));
    try {
      const result = await searchTeams(episodeId, searchQuery, true, teamsPage);
      setTeamsData(result);
    } catch (err) {
      setTeamsData(undefined);
      console.log(err);
    } finally {
      setTeamsLoading(false);
    }
  }

  async function fetchScrimsData(): Promise<void> {
    setScrimsLoading(true);
    setScrimsData((prev) => ({ count: prev?.count ?? 0 }));
    try {
      const result = await getScrimmagesByTeam(episodeId, undefined, teamsPage);
      setScrimsData(result);
    } catch (err) {
      setScrimsData(undefined);
      console.log(err);
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
        tourneyPage,
      );
    } catch (err) {
      setTourneyData(undefined);
      console.log(err);
    } finally {
      setTourneyLoading(false);
    }
  }

  useEffect(() => {
    if (!teamsLoading) {
      void fetchTeamsData();
    }
  }, [searchQuery, teamsPage]);

  useEffect(() => {
    if (!scrimsLoading) {
      void fetchScrimsData();
    }
  }, [scrimsPage]);

  useEffect(() => {
    if (!tourneyLoading) {
      void fetchTourneyData();
    }
  }, [tourneyPage]);

  return (
    <div className="flex h-full w-full flex-col overflow-auto p-6">
      <h1 className="mb-5 text-3xl font-bold leading-7 text-gray-900">
        Scrimmaging
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
            if (ev.key === "Enter") {
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

      <h1 className="mb-2 text-2xl font-bold leading-7 text-gray-900">
        Find a team to scrimmage!
      </h1>
      <div className="mb-4 w-5/6">
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
              value: (team) => "Hallo :)",
              // TODO: add "request scrimmage" button
            },
          ]}
          bottomElement={
            <BattlecodeTableBottomElement
              totalCount={teamsData?.count ?? 0}
              pageSize={10}
              currentPage={teamsPage}
              onPage={(page) => {
                setQueryParams({ ...queryParams, teamsPage: page.toString() });
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
            setQueryParams({ ...queryParams, scrimsPage: "1" });
            if (scrimsPage === 1 && !scrimsLoading) {
              void fetchScrimsData();
            }
          }}
        />
      </div>
      <div className="mb-4 w-5/6">
        <BattlecodeTable
          data={scrimsData?.results ?? []}
          loading={scrimsLoading}
          columns={[
            {
              header: "Score",
              value: (match) => <MyMatchResult match={match} />,
            },
            {
              header: "Δ",
              value: (match) => "TODO",
            },
            {
              header: "Opponent (Δ)",
              value: (match) => "TODO",
            },
            {
              header: "Ranked",
              value: (match) => (match.is_ranked ? "Ranked" : "Unranked"),
            },
            {
              header: "Status",
              value: (match) => "TODO",
            },
            {
              header: "Replay",
              value: (match) => "TODO",
            },
            {
              header: "Created At",
              value: (match) => new Date(match.created).toLocaleDateString(),
            },
          ]}
          bottomElement={
            <BattlecodeTableBottomElement
              totalCount={scrimsData?.count ?? 0}
              pageSize={10}
              currentPage={scrimsPage}
              onPage={(page) => {
                setQueryParams({ ...queryParams, scrimsPage: page.toString() });
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
            setQueryParams({ ...queryParams, tourneyPage: "1" });
            if (tourneyPage === 1 && !tourneyLoading) {
              void fetchTourneyData();
            }
          }}
        />
      </div>

      <div className="mb-4 w-5/6">
        <BattlecodeTable
          data={tourneyData?.results ?? []}
          loading={tourneyLoading}
          columns={[]}
          bottomElement={
            <BattlecodeTableBottomElement
              totalCount={tourneyData?.count ?? 0}
              pageSize={10}
              currentPage={tourneyPage}
              onPage={(page) => {
                setQueryParams({
                  ...queryParams,
                  tourneyPage: page.toString(),
                });
              }}
            />
          }
        />
      </div>
    </div>
  );
};

export default Scrimmaging;
