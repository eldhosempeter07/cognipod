import React from "react";
import profile from "../util/images/profile.jpg";

// Define the Member type
interface Member {
  memberId: string;
  name?: string;
  email?: string;
  profilePic?: string;
  memberType?: string;
}

// Define the props for MemberItem
interface MemberItemProps {
  member: Member;
  isAdmin: boolean;
  currentUserIsAdmin: boolean;
  onRemove: () => void;
}

const MemberItem: React.FC<MemberItemProps> = ({
  member,
  isAdmin,
  currentUserIsAdmin,
  onRemove,
}) => {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg mb-2">
      <div className="flex items-center">
        <img
          src={member.profilePic || profile} // Use a default profile image if none is provided
          alt={member.name}
          className="w-12 h-12 rounded-full mr-4"
        />
        <div>
          <div className="font-medium">{member.name}</div>
          <div className="text-sm text-gray-600">{member.email}</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {isAdmin && (
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
            Admin
          </span>
        )}
        {currentUserIsAdmin && !isAdmin && (
          <button
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

export default MemberItem;
