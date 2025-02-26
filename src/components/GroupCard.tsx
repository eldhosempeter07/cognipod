import React from "react";
import { StudyGroup, User } from "../util/types";

interface GroupCardProps {
  group: StudyGroup;
  user: User | null;
  onViewMore: () => void;
  onJoinGroup: () => void;
}

const GroupCard: React.FC<GroupCardProps> = ({
  group,
  user,
  onViewMore,
  onJoinGroup,
}) => {
  const isMember = group.members.some((member) => member.memberId === user?.id)
    ? true
    : false;
  console.log(isMember);

  const hasRequested = group.joinRequests.some(
    (request) => request.userId === user?.id
  );

  return (
    <div className="border border-yellow-600 rounded-lg p-4 bg-white shadow-lg">
      <h2 className="text-2xl font-semibold text-yellow-600">{group.name}</h2>
      <p className="text-gray-700 mt-2">{group.description}</p>
      <p className="text-gray-600 mt-1">Category: {group.category}</p>
      <p className="text-gray-600 mt-1">Members: {group.groupSize}</p>
      <div className="mt-4 space-x-2">
        <button
          onClick={onViewMore}
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition"
        >
          View group
        </button>
        {!isMember && (
          <button
            disabled={hasRequested}
            onClick={onJoinGroup}
            className="bg-yellow-600 disabled:bg-gray-400 text-white font-semibold uppercase text-sm px-4 py-2 rounded hover:bg-yellow-700 transition"
          >
            {group.groupType === "Private"
              ? hasRequested
                ? "Request Sent"
                : "Request To Join"
              : "Join"}
          </button>
        )}
      </div>
    </div>
  );
};

export default GroupCard;
