import React, { useEffect, useState } from "react";
import { useEpisodeId } from "../contexts/EpisodeContext";
import Table from "../components/Table";
import { type PaginatedTeamPublicList } from "../utils/types";
import { NavLink, useSearchParams } from "react-router-dom";
import Input from "../components/elements/Input";
import Button from "../components/elements/Button";
import { searchTeams } from "../utils/api/team";
import { PageTitle } from "../components/elements/BattlecodeStyle";
import TableBottom from "../components/TableBottom";

function trimString(str: string, maxLength: number): string {
  if (str.length > maxLength) {
    return str.slice(0, maxLength - 1) + "...";
  }
  return str;
}

const Rankings: React.FC = () => {
  const { episodeId } = useEpisodeId();

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
    <div className="ml-4 mt-4 flex w-5/6 flex-col pb-8">
      <div className="mb-3 flex w-4/5 flex-row items-center">
        <PageTitle>Rankings</PageTitle>
        <div className="w-4" />
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
        <div className="w-4" />
        <Button
          disabled={loading}
          label="Search!"
          variant="dark"
          onClick={() => {
            handleSearch();
          }}
        />
      </div>

      <Table
        data={data?.results ?? []}
        loading={loading}
        keyFromValue={(team) => team.id.toString()}
        bottomElement={
          <TableBottom
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
            key: "rating",
            value: (team) => Math.round(team.profile?.rating ?? 0),
          },
          {
            header: "Team",
            key: "team",
            value: (team) => (
              <NavLink to={`/team/${team.id}`} className="hover:underline">
                {trimString(team.name, 13)}
              </NavLink>
            ),
          },
          {
            header: "Members",
            key: "members",
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
            key: "quote",
            value: (team) => team.profile?.quote ?? "",
          },
          {
            header: "Eligibility",
            key: "eligibility",
            value: (team) =>
              (team.profile?.eligible_for ?? [])
                .map((e) => e.toString())
                .join(", "),
          },
          {
            header: "Auto-Accept Ranked",
            key: "auto_accept_ranked",
            value: (team) =>
              team.profile?.auto_accept_ranked !== undefined &&
              team.profile.auto_accept_ranked
                ? "Yes"
                : "No",
          },
          {
            header: "Auto-Accept Unranked",
            key: "auto_accept_unranked",
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
