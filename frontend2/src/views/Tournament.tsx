import React, { useState, useEffect, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
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
  const [page, setPage] = useState<number>(1);
  // TODO: add round select! pull from tournament query api call???
  const [round, setRound] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  const onPage = (page: number): void => {
    // TODO: implement me!
    console.log("page!", page);
  };

  useEffect(() => {
    const fetchMatches = async (): Promise<void> => {
      setLoading(true);
      try {
        const result = await getTournamentMatches(
          episodeId,
          teamId ?? undefined,
          tournamentId,
          round,
          page,
        );
        setMatches(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    void fetchMatches();
  }, [teamId, page, round]);

  return (
    <div className="flex h-full w-full flex-col bg-white p-6">
      {/* TODO: change to tournament name from tourney query and add LOADING COMPONENT!!! */}
      <h1 className="text-2xl font-bold">Tournament {tournamentId}</h1>
      <BattlecodeTable
        data={matches?.results ?? []}
        loading={loading}
        columns={[]}
        bottomElement={
          <BattlecodeTableBottomElement
            totalCount={matches?.count ?? 0}
            pageSize={10}
            currentPage={page}
            onPage={onPage}
          />
        }
      />
    </div>
  );
};

export default Tournament;
