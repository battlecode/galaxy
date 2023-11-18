import React, { useEffect, useState } from "react";
import type { Maybe } from "../utils/utilTypes";
import {
  type PaginatedSubmissionList,
  StatusBccEnum,
  type TournamentSubmission,
} from "../utils/types";
import { useEpisodeId } from "../contexts/EpisodeContext";
import { NavLink, createSearchParams } from "react-router-dom";
import {
  getAllSubmissions,
  getAllUserTournamentSubmissions,
} from "../utils/api/compete";
import SectionCard from "../components/SectionCard";
import BattlecodeTable from "../components/BattlecodeTable";
import { dateTime } from "../utils/dateTime";

const SubmissionStatusDisplays: Record<StatusBccEnum, string> = {
  [StatusBccEnum.New]: "Created",
  [StatusBccEnum.Que]: "Queued",
  [StatusBccEnum.Run]: "Running",
  [StatusBccEnum.Try]: "Will be retried",
  [StatusBccEnum.Ok]: "Success",
  [StatusBccEnum.Err]: "Failed",
  [StatusBccEnum.Can]: "Cancelled",
};

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
        <BattlecodeTable
          data={subData?.results ?? []}
          loading={subsLoading}
          columns={[
            {
              header: "Submitted At",
              value: (sub) => dateTime(sub.created).localFullString,
            },
            {
              header: "Status",
              value: (sub) =>
                sub.status === "OK!"
                  ? sub.accepted
                    ? "Accepted"
                    : "Rejected"
                  : SubmissionStatusDisplays[sub.status],
            },
            {
              header: "Description",
              value: (sub) => sub.description ?? "",
            },
            {
              header: "Package Name",
              value: (sub) => sub._package,
            },
            {
              header: "Submitter",
              value: (sub) => (
                <NavLink to={`/user/${sub.user}`} className="hover:underline">
                  {sub.username}
                </NavLink>
              ),
            },
            {
              header: "",
              value: (sub) => (
                <NavLink
                  className="text-cyan-600 hover:underline"
                  to={URL.createObjectURL(
                    new Blob([sub.logs], { type: "text/plain" }),
                  )}
                  target="_blank"
                >
                  View log
                </NavLink>
              ),
            },
            {
              header: "",
              value: (sub) => "Download",
            },
          ]}
        />
      </SectionCard>

      <SectionCard title="Tournament Submission History">
        <BattlecodeTable
          data={tourneySubData ?? []}
          loading={tourneySubsLoading}
          columns={[
            {
              header: "Tournament",
              value: (sub) => sub.tournament,
            },
            {
              header: "Submitted At",
              value: (sub) => dateTime(sub.created).localFullString,
            },
            {
              header: "Description",
              value: (sub) => sub.description,
            },
            {
              header: "Package Name",
              value: (sub) => sub._package,
            },
            {
              header: "Submitter",
              value: (sub) => (
                <NavLink to={`/user/${sub.user}`} className="hover:underline">
                  {sub.username}
                </NavLink>
              ),
            },
          ]}
        />
      </SectionCard>
    </div>
  );
};

export default Submissions;
