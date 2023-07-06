import { useContext, useEffect, useState } from "react";
import { EpisodeContext } from "../contexts/EpisodeContext";
import { Api } from "../utils/api";
import BattlecodeTable from "../components/BattlecodeTable";
import { PaginatedTeamPublicList } from "../utils/types/model/PaginatedTeamPublicList";
import BattlecodeTableBottomElement from "../components/BattlecodeTableBottomElement";

const Rankings: React.FC = () => {
  const episodeId = useContext(EpisodeContext);

  const [page, setPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [requireActiveSubmission, setRequireActiveSubmission] =
    useState<boolean>(false);

  const [data, setData] = useState<PaginatedTeamPublicList | undefined>(
    undefined
  );

  const queryVars = {
    episodeId: episodeId.episodeId,
    searchQuery: searchQuery,
    requireActiveSubmission: false,
    page: page,
  };

  useEffect(() => {
    Api.searchTeams(
      queryVars.episodeId,
      queryVars.searchQuery,
      queryVars.requireActiveSubmission,
      queryVars.page
    ).then((res) => setData(res));
  }, [queryVars]);

  if (!data) {
    return <>Loading...</>;
  }

  return (
    <>
      <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
        Rankings
      </h1>
      <div style={{ height: 100 }} />
      <BattlecodeTable
        data={data.results ?? []}
        bottomElement={
          <BattlecodeTableBottomElement
            totalCount={data.count ?? 0}
            pageSize={10}
            currentPage={page}
            onPage={(page) => setPage(page)}
          />
        }
        columns={[
          {
            header: "Rating",
            value: (team) => team.profile?.rating ?? 0,
          },
          {
            header: "Team",
            value: (team) => team.name,
          },
        ]}
      />
    </>
  );
};

export default Rankings;
