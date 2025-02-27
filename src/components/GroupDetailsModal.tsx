import React from "react";
import { StudyGroup } from "../util/types";
import { User } from "firebase/auth";

interface GroupDetailsModalProps {
  group: StudyGroup;
  user: User | null;
  onClose: () => void;
  onJoinGroup: () => void;
  hasRequestedToJoin: boolean;
}

const GroupDetailsModal: React.FC<GroupDetailsModalProps> = ({
  group,
  user,
  onClose,
  onJoinGroup,
  hasRequestedToJoin,
}) => {
  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-yellow-600 rounded-lg p-6 shadow-2xl w-11/12 max-w-md max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <img
          src={"https://picsum.photos/200"}
          alt={group.name}
          className="w-24 h-24 rounded-full object-cover"
        />
        {!group.members.some((member) => member.memberId === user?.uid) && (
          <button
            disabled={hasRequestedToJoin}
            onClick={onJoinGroup}
            className="bg-yellow-600 disabled:bg-gray-400 text-white font-semibold uppercase text-sm px-4 py-2 rounded hover:bg-yellow-700 transition"
          >
            {group.groupType === "Public"
              ? "Join"
              : hasRequestedToJoin
              ? "Request Sent"
              : "Request To Join"}
          </button>
        )}
      </div>
      <h2 className="text-2xl font-semibold text-yellow-600 text-center">
        {group.name} ({group.members.length})
      </h2>
      <p className="text-gray-700 mt-2">{group.description}</p>
      <div className="flex text-sm justify-between uppercase text-yellow-600 my-2 font-bold">
        <p>{group.category}</p>
        <p>{group.groupType}</p>
      </div>
      <div className="text-gray-600 mt-3">
        <span className="font-semibold underline">Rules</span>
        <ul>
          {group.rules.map((rule, index) => (
            <li className="list-none my-1" key={index}>
              {rule}
            </li>
          ))}
        </ul>
      </div>
      <div className="text-gray-600 mt-2">
        <div className="flex flex-wrap gap-2 mt-1">
          {group.tags.map((tag, index) => (
            <span
              key={index}
              className="bg-yellow-600 text-white px-2 py-1 rounded text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-4 flex justify-center">
        <button
          onClick={onClose}
          className="bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default GroupDetailsModal;
