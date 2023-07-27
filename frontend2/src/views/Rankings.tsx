import { useContext, useEffect, useState } from "react";
import { EpisodeContext } from "../contexts/EpisodeContext";
import { Api } from "../utils/api";
import BattlecodeTable from "../components/BattlecodeTable";
import { type PaginatedTeamPublicList } from "../utils/types/model/PaginatedTeamPublicList";
import BattlecodeTableBottomElement from "../components/BattlecodeTableBottomElement";
import { NavLink } from "react-router-dom";
import Input from "../components/elements/Input";
import Button from "../components/elements/Button";

function trimString(str: string, maxLength: number) {
  if (str.length > maxLength) {
    return str.slice(0, maxLength - 1) + "...";
  }
  return str;
}

const Rankings: React.FC = () => {
  const episodeId = useContext(EpisodeContext).episodeId;

  const [page, setPage] = useState<number>(1);
  const [searchText, setSearchText] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const [data, setData] = useState<PaginatedTeamPublicList | undefined>(
    undefined
  );

  function handlePage(page: number) {
    if (!loading) {
      setPage(page);
    }
  }

  useEffect(() => {
    setLoading(true);
    setData({ ...data, results: [] });

    Api.searchTeams(episodeId, searchQuery, false, page).then((res) => {
      setData(res);
      setLoading(false);
    });

    return () => {
      setLoading(false);
    };
  }, [searchQuery, page]);

  return (
    <div className="ml-10 flex flex-col w-full">
      <h1 className="mb-10 text-3xl font-bold leading-7 text-gray-900">
        Rankings
      </h1>
      <div className="mb-5 w-2/5 h-10 flex flex-row items-left justify-center">
        <div className="min-w-max max-w-full">
          <Input
            label=""
            placeholder="Search for a team..."
            value={searchText}
            onChange={(ev) => {
              setSearchText(ev.target.value);
            }}
          />
        </div>
        <div className="w-10" />
        <div className="min-w-max">
          <Button
            label="Search!"
            variant="dark"
            onClick={() => setSearchQuery(searchText)}
          />
        </div>
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
              (team.profile?.eligibleFor ?? [])
                .map((e) => e.toString())
                .join(", "),
          },
          {
            header: "Auto-Accept Ranked",
            value: (team) => (team.profile?.autoAcceptRanked ? "Yes" : "No"),
          },
          {
            header: "Auto-Accept Unranked",
            value: (team) => (team.profile?.autoAcceptUnranked ? "Yes" : "No"),
          },
        ]}
      />
    </div>
  );
};

export default Rankings;
