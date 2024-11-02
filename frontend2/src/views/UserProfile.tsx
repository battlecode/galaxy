import React, { useMemo } from "react";
import { useEpisodeId } from "contexts/EpisodeContext";
import { useParams } from "react-router-dom";
import { isNil } from "lodash";
import SectionCard from "components/SectionCard";
import { PageTitle } from "components/elements/BattlecodeStyle";
import { useEpisodeInfo } from "api/episode/useEpisode";
import TeamChart, { type ChartData } from "components/tables/chart/TeamChart";
import { useRatingHistoryList } from "api/compete/useCompete";
import { useUserInfoById, useTeamsByUser } from "api/user/useUser";

const isNilOrEmptyStr = (str: string | undefined | null): boolean => {
  return isNil(str) || str === "";
};

// rendered at /:episodeId/user/:userId
const UserProfile: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const { userId } = useParams();
  // TODO: in user loader, prefetch user teams useTeamsByUser?
  const episode = useEpisodeInfo({ id: episodeId });
  const id = parseInt(userId ?? "", 10);
  const user = useUserInfoById({ id });
  const userTeam = useTeamsByUser({id});
  const userTeamRatingHistory = useRatingHistoryList({ episodeId, teamId: userTeam.data?.[episodeId]?.id ?? -1 });
  // this is copypasted right now from home.tsx. make it not copypasted later?
  const userTeamRatingData: Record<string, ChartData[]> | undefined =
    useMemo(() => {
      console.log(userTeamRatingHistory);
      if (!userTeamRatingHistory.isSuccess) return undefined;
      const ratingRecord: Record<string, ChartData[]> = {};
      return userTeamRatingHistory.data.reduce((record, teamData) => {
        if (teamData.team_rating !== undefined) {
          record[teamData.team_rating.team.name] =
            teamData.team_rating.rating_history.map((match) => [
              match.timestamp.getTime(),
              match.rating,
            ]);
        }
        return record;
      }, ratingRecord);
    }, [userTeamRatingHistory]);

  if (isNil(user.data) || isNaN(id)) {
    console.log(user);
    console.log(id);
    return <UserNotFound />;
  }

  return (

    <div className="p-6">
      <PageTitle>User Profile</PageTitle>
      <div className="flex flex-col gap-8 xl:flex-row">
        <div className="flex flex-1 flex-col gap-8 xl:max-w-4xl">
          <SectionCard title="Profile">
            <div className="flex flex-col md:flex-row md:gap-8">
              <div className="flex flex-col items-center p-4">
                <img
                  className="h-24 w-24 rounded-full bg-gray-400 md:h-48 md:w-48"
                  src={user.data.profile?.avatar_url}
                />
                <div className="mt-6 text-center text-xl font-semibold">
                  {user.data.username}
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-4">
                <div>
                  <div className="text-sm text-gray-800">
                  <div className="font-medium">Biography</div>
                    {isNilOrEmptyStr(user.data.profile?.biography) ? (
                      <span className="italic text-gray-500">
                        This user does not have a biography.
                      </span>
                    ) : (
                      user.data.profile?.biography
                    )}
                  </div>
                  <div className="text-sm text-gray-800">
                  <div className="font-medium">School</div>
                    {isNilOrEmptyStr(user.data.profile?.school) ? (
                      <span className="italic text-gray-500">
                        This user does not have a school.
                      </span>
                    ) : (
                      user.data.profile?.biography
                    )}
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>
          <SectionCard title="Rating History">
          <TeamChart
              yAxisLabel="Rating"
              values={userTeamRatingData}
              loading={userTeamRatingHistory.isLoading}
              loadingMessage="Loading rating history..."
            />
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

const UserNotFound: React.FC = () => {
  const { userId } = useParams();
  return <div>User {userId} was not found.</div>;
};

export default UserProfile;
