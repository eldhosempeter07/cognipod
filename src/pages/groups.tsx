import React, { useState, useEffect, useContext } from "react";
import {
  addJoinRequest,
  fetchStudyGroups,
  joinStudyGroup,
} from "../util/firebase/services/group";
import { StudyGroup } from "../util/types";
import { AuthContext } from "../util/context/authContext";
import { useNavigate } from "react-router-dom";
import GroupDetailsModal from "../components/GroupDetailsModal";

const Groups = () => {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);
  const [groupSizeError, setGroupSizeError] = useState<string[]>([]);

  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const { user } = useContext(AuthContext) ?? { user: null };
  const navigate = useNavigate();

  // Fetch groups on initial load
  useEffect(() => {
    fetchGroups();
  }, []);

  // Fetch groups with infinite scroll
  const fetchGroups = async () => {
    setLoading(true);
    try {
      const { groups: newGroups, lastVisible: newLastVisible } =
        await fetchStudyGroups(lastVisible);

      setGroups((prev) => {
        const uniqueGroups = [...prev, ...newGroups].reduce((acc, group) => {
          if (!acc.some((g) => g.id === group.id)) acc.push(group);
          return acc;
        }, [] as StudyGroup[]);
        return uniqueGroups;
      });
      setLastVisible(newLastVisible);
    } catch (error) {
      console.error("Error fetching groups: ", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop ===
        document.documentElement.offsetHeight
      ) {
        fetchGroups();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastVisible]);

  // Handle joining a group
  const handleJoinGroup = async (group: StudyGroup) => {
    const { id, groupType, groupSize, members } = group;

    if (members.length == groupSize && id) {
      return setGroupSizeError((prev) => [...prev, id]);
    }
    if (!user?.uid) return;
    try {
      if (groupType === "Private") {
        id && (await addJoinRequest(id, user.uid, "member"));
      } else {
        id &&
          (await joinStudyGroup({
            groupId: id,
            userId: user.uid,
            userType: "member",
          }));
      }

      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          group.id === id
            ? {
                ...group,
                members: [
                  ...group.members,
                  {
                    memberId: user.uid,
                    memberType: "member",
                    joinDate: new Date(),
                  },
                ],
                groupSize: group.groupSize + 1,
              }
            : group
        )
      );

      if (selectedGroup?.id === id) {
        setSelectedGroup((prevGroup) =>
          prevGroup
            ? {
                ...prevGroup,
                members: [
                  ...prevGroup.members,
                  {
                    memberId: user.uid,
                    memberType: "member",
                    joinDate: new Date(),
                  },
                ],
                groupSize: prevGroup.groupSize + 1,
              }
            : prevGroup
        );
      }
    } catch (error) {
      console.error("Error joining group: ", error);
    }
  };

  // Handle viewing group details
  const handleViewMore = (group: StudyGroup) => {
    if (group.groupType === "Public") {
      navigate(`/group/${group.id}`);
    } else if (!group.members.some((member) => member.memberId === user?.uid)) {
      setSelectedGroup(group);
    } else {
      navigate(`/group/${group.id}`);
    }
  };

  // Check if the user has requested to join a group
  const hasRequestedToJoin = (groupId: string) => {
    if (!user) return false;
    return (
      selectedGroup?.joinRequests.some(
        (request) => request.userId === user.uid
      ) ||
      groups
        .find((group) => group.id === groupId)
        ?.joinRequests.some((request) => request.userId === user.uid)
    );
  };

  return (
    <div className="bg-white text-black min-h-screen p-6 mt-16">
      <h1 className="text-3xl font-bold text-center mb-6 text-yellow-600">
        All Study Groups
      </h1>
      <div className="space-y-4">
        {groups.map((group) => (
          <div
            key={group.id}
            className="border border-yellow-600 rounded-lg p-4 bg-white shadow-lg"
          >
            <h2 className="text-2xl font-semibold text-yellow-600">
              {group.name}
            </h2>
            <p className="text-gray-700 mt-2">{group.description}</p>
            <p className="text-gray-600 mt-1">Category: {group.category}</p>
            <p className="text-gray-600 mt-1">
              Members: {group.members.length}{" "}
            </p>
            <div className="mt-4 space-x-2">
              <button
                onClick={() => handleViewMore(group)}
                className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition"
              >
                View group
              </button>
              {!group.members.some(
                (member) => member.memberId === user?.uid
              ) && (
                <button
                  disabled={!!(group.id && hasRequestedToJoin(group.id))}
                  onClick={() => group.id && handleJoinGroup(group)}
                  className="bg-yellow-600 disabled:bg-gray-400 text-white font-semibold  text-sm px-4 py-2 rounded hover:bg-yellow-700 transition"
                >
                  {group.groupType === "Public"
                    ? "Join"
                    : group.id && hasRequestedToJoin(group.id)
                    ? "Request Sent"
                    : "Request To Join"}
                </button>
              )}
            </div>
            {group.id && groupSizeError.includes(group.id) ? (
              <span className="text-red-500 font-semibold ">
                Group is already full
              </span>
            ) : null}
          </div>
        ))}
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center mt-6">
          <p className="text-yellow-600">Loading...</p>
        </div>
      )}

      {/* Group Details Modal */}
      {selectedGroup && (
        <GroupDetailsModal
          group={selectedGroup}
          user={user}
          onClose={() => setSelectedGroup(null)}
          onJoinGroup={() => selectedGroup.id && handleJoinGroup(selectedGroup)}
          hasRequestedToJoin={
            !!(selectedGroup.id && hasRequestedToJoin(selectedGroup.id))
          }
        />
      )}
    </div>
  );
};

export default Groups;
