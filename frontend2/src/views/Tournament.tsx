import React, { useState, useEffect, useRef, useContext } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { type PaginatedMatchList } from "../utils/types";
import { getTournamentMatches } from "../utils/api/compete";
import { EpisodeContext } from "../contexts/EpisodeContext";
import BattlecodeTable from "../components/BattlecodeTable";
import BattlecodeTableBottomElement from "../components/BattlecodeTableBottomElement";

const Tournament: React.FC = () => {
  const episodeId = useContext(EpisodeContext).episodeId;
  const { tournamentId } = useParams();

  const [matches, setMatches] = useState<PaginatedMatchList | undefined>(
    undefined,
  );
  // TODO: add team async select!
  const [teamId, setTeamId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [queryParams, setQueryParams] = useSearchParams({
    page: "1",
  });

  const page = parseInt(queryParams.get("page") ?? "1");

  const handlePage = (page: number): void => {
    // TODO: implement me!
    console.log("page!", page);
  };

  useEffect(() => {
    const fetchMatches = async (): Promise<void> => {
      setLoading(true);
      setMatches((prev) => ({ count: prev?.count ?? 0 }));
      try {
        const result = await getTournamentMatches(
          episodeId,
          teamId ?? undefined,
          tournamentId,
          // TODO: add round? what does it mean?
          undefined,
          page,
        );
        setMatches(result);
      } catch (err) {
        setMatches(undefined);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    void fetchMatches();
  }, [teamId, page]);

  return (
    <div className="flex h-full w-full flex-col bg-white p-6">
      {/* TODO: change to tournament name from tourney query and add LOADING COMPONENT!!! */}
      <h1 className="mb-4 text-2xl font-bold">Tournament {tournamentId}</h1>
      <div className="mb-2 w-5/6">
        <BattlecodeTable
          data={matches?.results ?? []}
          loading={loading}
          columns={[]}
          bottomElement={
            <BattlecodeTableBottomElement
              totalCount={matches?.count ?? 0}
              pageSize={10}
              currentPage={page}
              onPage={handlePage}
            />
          }
        />
      </div>
    </div>
  );
};

export default Tournament;
