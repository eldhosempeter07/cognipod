import React, { useContext, useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css"; // Import the CSS for Skeleton
import LoadingScreen from "../components/loadingScreen";
import GroupDetailsModal from "../components/GroupDetailsModal";
import { AuthContext } from "../util/context/authContext";
import {
  addJoinRequest,
  fetchStudyGroups,
  joinStudyGroup,
} from "../util/firebase/services/group";
import { StudyGroup } from "../util/types";
import { useNavigate } from "react-router-dom";

const Groups = () => {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [groupSizeError, setGroupSizeError] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useContext(AuthContext) ?? { user: null };
  const navigate = useNavigate();
  const limitPerPage = 4;

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setLoading(true);
      fetchGroups(currentPage, limitPerPage, searchQuery);
      setLoading(false);
    }, 100);

    return () => clearTimeout(debounceTimer);
  }, [currentPage, searchQuery]);

  const fetchGroups = async (
    page: number,
    limit: number,
    searchQuery?: string
  ) => {
    setLoading(true);
    try {
      const { groups: newGroups, totalCount } = await fetchStudyGroups(
        page,
        limit,
        searchQuery
      );

      setGroups(newGroups);
      setFilteredGroups(newGroups);
      setTotalPages(Math.ceil(totalCount / limit));
    } catch (error) {
      console.error("Error fetching groups: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (group: StudyGroup) => {
    const { id, groupType, groupSize, members } = group;

    if (members.length === groupSize && id) {
      return setGroupSizeError((prev) => [...prev, id]);
    }
    if (!user?.uid) return;
    try {
      if (groupType === "Private") {
        if (id) {
          await addJoinRequest(id, user.uid, "member");

          setGroups((prevGroups) =>
            prevGroups.map((group) =>
              group.id === id
                ? {
                    ...group,
                    joinRequests: [
                      ...group.joinRequests,
                      {
                        memberId: user.uid,
                        userType: "member",
                        joinDate: new Date(),
                        groupId: id,
                        userId: user.uid,
                      },
                    ],
                  }
                : group
            )
          );

          if (selectedGroup?.id === id) {
            setSelectedGroup((prevGroup) =>
              prevGroup
                ? {
                    ...prevGroup,
                    joinRequests: [
                      ...prevGroup.joinRequests,
                      {
                        memberId: user.uid,
                        userType: "member",
                        joinDate: new Date(),
                        groupId: id,
                        userId: user.uid,
                      },
                    ],
                  }
                : prevGroup
            );
          }
        }
      } else {
        if (id) {
          id &&
            group.id &&
            (await joinStudyGroup({
              groupId: id,
              userId: user.uid,
              userType: "member",
            }));

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
                        userId: user.uid,
                      },
                    ],
                  }
                : group
            )
          );
        }
      }
    } catch (error) {
      console.error("Error joining group: ", error);
    }
  };

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

  const handleViewMore = (group: StudyGroup) => {
    if (group.groupType === "Public") {
      navigate(`/group/${group.id}`);
    } else if (!group.members.some((member) => member.memberId === user?.uid)) {
      setSelectedGroup(group);
    } else {
      navigate(`/group/${group.id}`);
    }
  };

  return (
    <>
      <div className="bg-white text-black min-h-screen p-6 mt-16">
        <h1 className="text-3xl font-bold text-center mb-6 text-yellow-600">
          All Study Groups
        </h1>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search groups by name, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border border-yellow-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
          />
        </div>

        <div className="space-y-4">
          {loading && groups.length === 0
            ? Array.from({ length: limitPerPage }).map((_, index) => (
                <div
                  key={index}
                  className="border border-yellow-600 rounded-lg p-4 bg-white shadow-lg"
                >
                  <Skeleton height={30} width="60%" />
                  <Skeleton height={20} width="80%" className="mt-2" />
                  <Skeleton height={20} width="40%" className="mt-1" />
                  <Skeleton height={20} width="30%" className="mt-1" />
                  <div className="mt-4 space-x-2">
                    <Skeleton height={40} width={100} />
                    <Skeleton height={40} width={150} />
                  </div>
                </div>
              ))
            : filteredGroups.map((group) => (
                <div
                  key={group.id}
                  className="border border-yellow-600 rounded-lg p-4 bg-white shadow-lg"
                >
                  <h2 className="text-2xl font-semibold text-yellow-600">
                    {group.name}
                  </h2>
                  <p className="text-gray-700 mt-2">{group.description}</p>
                  <p className="text-gray-600 mt-1">
                    Category: {group.category}
                  </p>
                  <p className="text-gray-600 mt-1">
                    Members: {group.members.length}
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
                        onClick={() => handleJoinGroup(group)}
                        className="bg-yellow-600 text-white font-semibold text-sm px-4 py-2 rounded hover:bg-yellow-700 transition"
                      >
                        {group.groupType === "Public"
                          ? "Join"
                          : "Request To Join"}
                      </button>
                    )}
                  </div>
                  {group.id && groupSizeError.includes(group.id) && (
                    <span className="text-red-500 font-semibold">
                      Group is already full
                    </span>
                  )}
                </div>
              ))}
        </div>

        {!loading && groups && (
          <div className="flex justify-center mt-6 space-x-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:bg-gray-400"
            >
              Previous
            </button>
            <span className="text-yellow-600 font-bold mt-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:bg-gray-400"
            >
              Next
            </button>
          </div>
        )}

        {selectedGroup && (
          <GroupDetailsModal
            group={selectedGroup}
            user={user}
            onClose={() => setSelectedGroup(null)}
            onJoinGroup={() =>
              selectedGroup.id && handleJoinGroup(selectedGroup)
            }
            hasRequestedToJoin={
              !!(selectedGroup.id && hasRequestedToJoin(selectedGroup.id))
            }
          />
        )}
      </div>
    </>
  );
};

export default Groups;
