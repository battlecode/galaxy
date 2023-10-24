import React from "react";
import { type UserPublic } from "../../utils/types";
import { useCurrentUser } from "../../contexts/CurrentUserContext";

interface MemberListProps {
  members: UserPublic[];
  className?: string;
}

interface UserRowProps {
  user: UserPublic;
  isCurrentUser?: boolean;
}
const UserRow: React.FC<UserRowProps> = ({ user, isCurrentUser = false }) => {
  return (
    <div className="flex flex-row items-center rounded">
      <img
        className="h-8 w-8 rounded-full bg-blue-100"
        src={user.profile?.avatar_url}
      />
      <div className="ml-6 font-semibold">
        {user.username}
        {isCurrentUser && (
          <span className="ml-1 font-normal text-gray-600">(you)</span>
        )}
        {user.is_staff && (
          <span className="ml-1 font-normal text-gray-600">(staff)</span>
        )}
      </div>
      <div className="ml-12 flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap text-end text-gray-600">
        {user.profile?.school}
      </div>
    </div>
  );
};

// Displays a list of the users in members. If the current user is in members,
// displays the current user first.
const MemberList: React.FC<MemberListProps> = ({ members, className = "" }) => {
  const { user: currentUser } = useCurrentUser();
  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      {/* display current user first */}
      {currentUser !== undefined && (
        <UserRow isCurrentUser user={currentUser} />
      )}
      {members.map(
        (member) =>
          member.id !== currentUser?.id && (
            <UserRow key={member.id} user={member} />
          ),
      )}
    </div>
  );
};

export default MemberList;
