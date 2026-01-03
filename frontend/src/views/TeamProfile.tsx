import type React from "react";
import { useMemo } from "react";
import { useEpisodeId } from "contexts/EpisodeContext";
import { useParams } from "react-router-dom";
import { useTeam } from "api/team/useTeam";
import { isNil } from "lodash";
import SectionCard from "components/SectionCard";
import { PageTitle, PageContainer } from "components/elements/BattlecodeStyle";
import MemberList from "components/team/MemberList";
import { Status526Enum } from "api/_autogen";
import { useEpisodeInfo } from "api/episode/useEpisode";
import PageNotFound from "./PageNotFound";
import TeamChart from "components/compete/chart/TeamChart";
import { useTeamRatingHistory } from "api/compete/useCompete";
import ScrimmagingRecord from "components/compete/ScrimmagingRecord";
import { getEligibilities } from "api/helpers";

const isNilOrEmptyStr = (str: string | undefined | null): boolean =>
  isNil(str) || str === "";

// rendered at /:episodeId/team/:teamId
const TeamProfile: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const { teamId } = useParams(); // Always defined, else loader will redirect

  const episode = useEpisodeInfo({ id: episodeId });
  const team = useTeam({ episodeId, id: teamId ?? "" });
  const teamRating = useTeamRatingHistory({
    episodeId,
    teamId: parseInt(teamId ?? ""),
  });

  const membersList = useMemo(
    () => (
      <div className="flex flex-col gap-8">
        <MemberList members={team.data?.members ?? []} />
      </div>
    ),
    [team],
  );

  const eligibles = useMemo(
    () =>
      getEligibilities(
        episode.data?.eligibility_criteria ?? [],
        team.data?.profile?.eligible_for ?? [],
      ),
    [episode, team],
  );

  if (team.isError) {
    return <PageNotFound />;
  }

  return (
    <PageContainer>
      <PageTitle>Team Profile</PageTitle>
      <div className="flex flex-col gap-8 xl:flex-row">
        <div className="flex flex-1 flex-col gap-8 xl:max-w-4xl">
          <SectionCard title="Profile" className="" loading={team.isLoading}>
            {team.isSuccess && (
              <div className="flex flex-col md:flex-row md:gap-8">
                <div className="flex flex-col items-center p-4">
                  <img
                    className="h-24 w-24 rounded-full bg-gray-400 md:h-48 md:w-48"
                    src={
                      team.data.profile?.avatar_url ??
                      "/default_profile_picture.png"
                    }
                  />
                  <div className="mt-6 text-center text-xl font-semibold">
                    {team.data.name}
                  </div>
                  {team.data.status === Status526Enum.S && (
                    <div className="text-sm font-light text-gray-500">
                      (staff team)
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-4">
                  <div>
                    <div className="font-medium">Quote</div>
                    <div className="text-sm text-gray-800">
                      {isNilOrEmptyStr(team.data.profile?.quote) ? (
                        <span className="italic text-gray-500">
                          This team does not have a quote
                        </span>
                      ) : (
                        team.data.profile?.quote
                      )}
                    </div>
                    {team.data.status === Status526Enum.S && (
                      <div className="text-sm font-light text-gray-500">
                        (staff team)
                      </div>
                    )}
                  </div>
                  <div>
                    <div>
                      <div className="font-medium">Biography</div>
                      <div className="text-sm text-gray-800">
                        {isNilOrEmptyStr(team.data.profile?.biography) ? (
                          <span className="italic text-gray-500">
                            This team does not have a biography
                          </span>
                        ) : (
                          team.data.profile?.biography
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Eligibility</div>
                      <div className="text-sm text-gray-800">
                        {eligibles.length !== 0 ? (
                          eligibles.map((criterion) => (
                            <div key={criterion.id}>
                              {criterion.title}
                              {"  "}
                              {criterion.icon}
                            </div>
                          ))
                        ) : (
                          <span className="italic text-gray-500">
                            This team did not select any eligibility criteria.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </SectionCard>
          <SectionCard title="Rating History">
            <TeamChart
              teamRatings={teamRating.isSuccess ? [teamRating.data] : []}
              loading={teamRating.isLoading}
            />
          </SectionCard>
          {/* The members list/record that displays when on a smaller screen */}
          <div className="flex shrink flex-col gap-8 xl:hidden">
            <SectionCard title="Members">{membersList}</SectionCard>
            <SectionCard title="Record">
              {team.isSuccess && (
                <ScrimmagingRecord team={team.data} hideTeamName />
              )}
            </SectionCard>
          </div>
        </div>

        {/* The members list/record that displays to the right side when on a big screen. */}
        <div className="hidden w-1/3 shrink gap-8 xl:flex xl:flex-col">
          <SectionCard title="Members">{membersList}</SectionCard>
          <SectionCard title="Record">
            {team.isSuccess && (
              <ScrimmagingRecord team={team.data} hideTeamName />
            )}
          </SectionCard>
        </div>
      </div>
    </PageContainer>
  );
};

export default TeamProfile;
