import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../util/context/authContext";
import {
  fetchGroupDetails,
  updateGroupMembers,
} from "../util/firebase/services/group";
import { StudyGroup } from "../util/types";
import profile from "../util/images/profile.jpg";
import Popup from "../components/popup";
import MemberItem from "../components/memberItem";

const MembersPage = () => {
  const { groupId } = useParams();
  const { user } = useContext(AuthContext) ?? { user: null };
  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadGroup = async () => {
      if (groupId) {
        const groupData = await fetchGroupDetails(groupId);
        setGroup(groupData);
      }
    };
    loadGroup();
  }, [groupId]);

  if (!group) return <div>Loading...</div>;

  const admins = group.members.filter((m) =>
    group.groupAdmin.includes(m.memberId)
  );
  const members = group.members.filter(
    (m) => !group.groupAdmin.includes(m.memberId)
  );

  const handleRemoveMember = async (memberId: string) => {
    if (!groupId || !user || !group.groupAdmin.includes(user.uid)) return;

    // Update group members in Firestore
    const updatedMembers = group.members.filter((m) => m.memberId !== memberId);
    await updateGroupMembers(groupId, updatedMembers);
    setGroup({ ...group, members: updatedMembers });
    setShowDeleteConfirmation(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-500 hover:underline"
      >
        &larr; Back to Group
      </button>

      <h1 className="text-3xl font-bold mb-6">{group.name} Members</h1>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Admins</h2>
          {admins.map((admin) => (
            <MemberItem
              key={admin.memberId}
              member={admin}
              isAdmin={true}
              currentUserIsAdmin={group.groupAdmin.includes(user?.uid || "")}
              onRemove={() => {
                setSelectedMember(admin.memberId);
                setShowDeleteConfirmation(true);
              }}
            />
          ))}
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Members</h2>
          {members.map((member) => (
            <MemberItem
              key={member.memberId}
              member={member}
              isAdmin={false}
              currentUserIsAdmin={group.groupAdmin.includes(user?.uid || "")}
              onRemove={() => {
                setSelectedMember(member.memberId);
                setShowDeleteConfirmation(true);
              }}
            />
          ))}
        </div>
      </div>

      {showDeleteConfirmation && (
        <Popup
          onClose={() => setShowDeleteConfirmation(false)}
          onConfirm={() => handleRemoveMember(selectedMember)}
          heading="Remove Member"
          body="Are you sure you want to remove this member from the group?"
          buttonText="Remove Member"
          input={false}
        />
      )}
    </div>
  );
};

export default MembersPage;
