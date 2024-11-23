import React from "react";
import { useEpisodeId } from "contexts/EpisodeContext";
import { Link, useParams } from "react-router-dom";
import { isNil } from "lodash";
import SectionCard from "components/SectionCard";
import { PageTitle } from "components/elements/BattlecodeStyle";
import { useUserInfoById, useTeamsByUser } from "api/user/useUser";
import { isNilOrEmptyStr } from "api/helpers";


// rendered at /:episodeId/user/:userId
const UserProfile: React.FC = () => {
  const { episodeId } = useEpisodeId();
  const { userId } = useParams();
  const id = parseInt(userId ?? "", 10);
  const user = useUserInfoById({ id });
  const userTeam = useTeamsByUser({ id });
  if (isNil(user.data) || isNaN(id)) {
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
              <div className="flex flex-1 flex-col gap-4 text-sm text-gray-800">
                <div>
                  <div className="font-semibold">Team</div>
                  {isNilOrEmptyStr(userTeam.data?.[episodeId]?.name) ? (
                    <span className="italic text-gray-500">
                      This user does not have a team.
                    </span>
                  ) : (
                    <Link
                      to={`/${episodeId}/team/${
                        userTeam.data?.[episodeId]?.id ?? 0
                      }`}
                    >
                      {userTeam.data?.[episodeId]?.name}
                    </Link>
                  )}
                </div>
                <div>
                  <div className="font-semibold">Biography</div>
                  {isNilOrEmptyStr(user.data.profile?.biography) ? (
                    <span className="italic text-gray-500">
                      This user does not have a biography.
                    </span>
                  ) : (
                    user.data.profile?.biography
                  )}
                </div>
                <div>
                  <div className="font-semibold">School</div>
                  {isNilOrEmptyStr(user.data.profile?.school) ? (
                    <span className="italic text-gray-500">
                      This user does not have a school.
                    </span>
                  ) : (
                    user.data.profile?.school
                  )}
                </div>
              </div>
            </div>
          </SectionCard>
          <SectionCard title="Rating History"></SectionCard>
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
