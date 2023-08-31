import React, { useContext, useEffect, useState } from "react";
import { EpisodeContext } from "../contexts/EpisodeContext";
import BattlecodeTable from "../components/BattlecodeTable";
import { type PaginatedTeamPublicList } from "../utils/types";
import BattlecodeTableBottomElement from "../components/BattlecodeTableBottomElement";
import { NavLink, useSearchParams } from "react-router-dom";
import Input from "../components/elements/Input";
import Button from "../components/elements/Button";
import { searchTeams } from "../utils/api/team";
import { PageTitle } from "../components/elements/BattlecodeStyle";

function trimString(str: string, maxLength: number): string {
  if (str.length > maxLength) {
    return str.slice(0, maxLength - 1) + "...";
  }
  return str;
}

const Rankings: React.FC = () => {
  const episodeId = useContext(EpisodeContext).episodeId;

  const [searchText, setSearchText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<PaginatedTeamPublicList | undefined>(
    undefined,
  );

  const [queryParams, setQueryParams] = useSearchParams({
    page: "1",
    search: "",
  });
  const page = parseInt(queryParams.get("page") ?? "1");
  const searchQuery = queryParams.get("search") ?? "";

  function handlePage(page: number): void {
    if (!loading) {
      setQueryParams({ ...queryParams, page: page.toString() });
    }
  }

  function handleSearch(): void {
    if (!loading && searchText !== searchQuery) {
      setQueryParams({ ...queryParams, search: searchText });
    }
  }

  useEffect(() => {
    setLoading(true);

    const search = async (): Promise<void> => {
      try {
        const result = await searchTeams(episodeId, searchQuery, false, page);
        setData(result);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };

    void search();

    return () => {
      setLoading(false);
    };
  }, [searchQuery, page]);

  return (
    <div className="mb-20 ml-4 mt-4 flex w-5/6 flex-col">
      <PageTitle>Rankings</PageTitle>
      <div className="justify-left mb-5 flex h-10 w-4/5 flex-row items-center">
        <Input
          disabled={loading}
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
          disabled={loading}
          label="Search!"
          variant="dark"
          onClick={() => {
            handleSearch();
          }}
        />
      </div>

      <BattlecodeTable
        data={data?.results ?? []}
        loading={loading}
        bottomElement={
          <BattlecodeTableBottomElement
            totalCount={data?.count ?? 0}
            pageSize={10}
            currentPage={page}
            onPage={(page) => {
              handlePage(page);
            }}
          />
        }
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
            header: "Eligibility",
            value: (team) =>
              (team.profile?.eligible_for ?? [])
                .map((e) => e.toString())
                .join(", "),
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
        ]}
      />
    </div>
  );
};

export default Rankings;
