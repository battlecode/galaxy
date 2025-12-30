import type React from "react";

import { NavLink, useParams } from "react-router-dom";

import { useMatchInfo, useSubmissionInfo } from "api/compete/useCompete";
import { useEpisodeId } from "contexts/EpisodeContext";

import { PageTitle } from "components/elements/BattlecodeStyle";
import SectionCard from "components/SectionCard";

import type { Submission } from "api/_autogen";
import { useUserTeam } from "api/team/useTeam";
import { isPresent } from "utils/utilTypes";
import PageNotFound from "./PageNotFound";
import type { UseQueryResult } from "@tanstack/react-query";
import { dateTime } from "utils/dateTime";

const MatchProfile: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const { matchId } = useParams();
  const teamData = useUserTeam({ episodeId });
  const match = useMatchInfo({ episodeId, id: matchId ?? "" });

  const getUserSubmission = (): UseQueryResult<Submission> | undefined => {
    if (!isPresent(match.data?.participants) || !isPresent(teamData.data))
      return undefined;

    const id = match.data?.participants
      .find((participant) => participant.team === teamData.data?.id)
      ?.submission.toString();

    if (!isPresent(id)) return undefined;

    return useSubmissionInfo({ episodeId, id });
  };

  const submission = getUserSubmission();

  if (match.isError) {
    return <PageNotFound />;
  }

  return (
    <div className="p-6">
      <PageTitle>Match Profile</PageTitle>
      <div className="flex h-full w-full flex-col overflow-auto">
        <SectionCard title="Submission" loading={match.isLoading}>
          {isPresent(submission) && submission.isSuccess && (
            <>
              <ul>
                <li>
                  Submitted At:{" "}
                  {dateTime(submission.data.created).localFullString}
                </li>
                <li>
                  Description:{" "}
                  {
                    submission.data.description ??
                      "None provided" /* shouldn't happen */
                  }
                </li>
                <li>Package Name: {submission.data._package ?? "None"}</li>
                <li>
                  Submitter:{" "}
                  {
                    <NavLink
                      to={`/user/${submission.data.user}`}
                      className="hover:underline"
                    >
                      {submission.data.username}
                    </NavLink>
                  }
                </li>
              </ul>
            </>
          )}
        </SectionCard>
      </div>
    </div>
  );
};

export default MatchProfile;
