import type React from "react";

import { NavLink, useParams } from "react-router-dom";

import { useMatchInfo } from "api/compete/useCompete";
import { useEpisodeId } from "contexts/EpisodeContext";

import { PageTitle } from "components/elements/BattlecodeStyle";
import SectionCard from "components/SectionCard";

import type { Match, TeamPrivate } from "api/_autogen";
import { useUserTeam } from "api/team/useTeam";
import { isPresent } from "utils/utilTypes";
import PageNotFound from "./PageNotFound";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { dateTime } from "utils/dateTime";
import { buildKey } from "api/helpers";
import { submissionInfoFactory } from "api/compete/competeFactories";

const MatchDetails: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const { matchId } = useParams();
  const teamData = useUserTeam({ episodeId });
  const match = useMatchInfo({ episodeId, id: matchId ?? "" });

  const getUserSubmissionId = (
    match: UseQueryResult<Match>,
    team: UseQueryResult<TeamPrivate>,
  ): string => {
    if (!isPresent(match.data?.participants) || !isPresent(team.data))
      return "";

    return (
      match.data?.participants
        .find((participant) => participant.team === team.data?.id)
        ?.submission.toString() ?? ""
    );
  };

  const id = getUserSubmissionId(match, teamData);

  const submission = useQuery({
    queryKey: buildKey(submissionInfoFactory.queryKey, {
      episodeId,
      id,
    }),
    queryFn: async () =>
      await submissionInfoFactory.queryFn({
        episodeId,
        id,
      }),
    enabled: id.length !== 0,
  });

  if (match.isError) {
    return <PageNotFound />;
  }

  return (
    <div className="p-6">
      <PageTitle>Match Details</PageTitle>
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

export default MatchDetails;
