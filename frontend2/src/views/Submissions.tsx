import React, { useEffect, useState } from "react";
import type { Maybe } from "../utils/utilTypes";
import {
  type PaginatedSubmissionList,
  type TournamentSubmission,
} from "../utils/types";
import { useEpisodeId } from "../contexts/EpisodeContext";
import {
  getAllSubmissions,
  getAllUserTournamentSubmissions,
} from "../utils/api/compete";
import SectionCard from "../components/SectionCard";
import SubHistoryTable from "../components/tables/submissions/SubHistoryTable";
import TourneySubTable from "../components/tables/submissions/TourneySubTable";

const Submissions: React.FC = () => {
  const { episodeId } = useEpisodeId();

  const [subsLoading, setSubsLoading] = useState<boolean>(false);
  const [tourneySubsLoading, setTourneySubsLoading] = useState<boolean>(false);

  const [subData, setSubData] = useState<Maybe<PaginatedSubmissionList>>();
  const [tourneySubData, setTourneySubData] =
    useState<Maybe<TournamentSubmission[]>>();

  useEffect(() => {
    let isActiveLookup = true;
    if (subsLoading) return;
    setSubsLoading(true);
    setSubData((prev) => ({ count: prev?.count ?? 0 }));

    const fetchSubs = async (): Promise<void> => {
      try {
        const result = await getAllSubmissions(episodeId, 1);
        if (isActiveLookup) {
          setSubData(result);
        }
      } catch (err) {
        if (isActiveLookup) {
          setSubData(undefined);
        }
        console.error(err);
      } finally {
        if (isActiveLookup) {
          setSubsLoading(false);
        }
      }
    };

    void fetchSubs();

    return () => {
      isActiveLookup = false;
    };
  }, [episodeId]);

  useEffect(() => {
    let isActiveLookup = true;
    if (tourneySubsLoading) return;
    setTourneySubsLoading(true);
    setTourneySubData([]);

    const fetchTourneySubs = async (): Promise<void> => {
      try {
        const result = await getAllUserTournamentSubmissions(episodeId);
        if (isActiveLookup) {
          setTourneySubData(result);
        }
      } catch (err) {
        if (isActiveLookup) {
          setTourneySubData(undefined);
        }
        console.error(err);
      } finally {
        if (isActiveLookup) {
          setTourneySubsLoading(false);
        }
      }
    };

    void fetchTourneySubs();

    return () => {
      isActiveLookup = false;
    };
  }, [episodeId]);

  return (
    <div className="flex h-full w-full flex-col overflow-auto p-6">
      <h1 className="mb-5 text-3xl font-bold leading-7 text-gray-900">
        Submissions
      </h1>

      <SectionCard title="Submission History" className="mb-8">
        <SubHistoryTable data={subData} loading={subsLoading} />
      </SectionCard>

      <SectionCard title="Tournament Submission History">
        <TourneySubTable data={tourneySubData} loading={tourneySubsLoading} />
      </SectionCard>
    </div>
  );
};

export default Submissions;
