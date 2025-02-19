import React, { useState, useEffect, useContext } from "react";
import { fetchStudyGroups, joinStudyGroup } from "../util/firebaseServices";
import { StudyGroup } from "../util/types";
import LoadingScreen from "../components/loadingScreen";
import { AuthContext } from "../util/context/authContext";
import { useNavigate } from "react-router-dom";

const Groups = () => {
  const [groups, setGroups] = useState<StudyGroup[]>([]); // List of groups
  const [lastVisible, setLastVisible] = useState(null); // Last document for pagination
  const [loading, setLoading] = useState(false); // Loading state
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null); // Selected group for popup
  const { user } = useContext(AuthContext) ?? {
    user: null,
    loading: true,
  };

  const navigate = useNavigate();

  // Fetch initial 5 groups
  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const { groups: newGroups, lastVisible: newLastVisible } =
        await fetchStudyGroups(lastVisible);

      setGroups((prev) => {
        const uniqueGroups = [...prev, ...newGroups].reduce((acc, group) => {
          if (!acc.some((g) => g.id === group.id)) {
            acc.push(group);
          }
          return acc;
        }, [] as StudyGroup[]);
        return uniqueGroups;
      });
      setLastVisible(newLastVisible);
    } catch (error) {
      console.error("Error fetching groups: ", error);
    }
    setLoading(false);
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

  // Handle join group
  const handleJoinGroup = async (groupId: string) => {
    try {
      if (user?.uid !== undefined) {
        const userId = user?.uid;
        const userType = "student";

        // Call the joinStudyGroup function to update Firestore
        await joinStudyGroup({ groupId, userId, userType });

        // Update the local state to reflect the new member
        setGroups((prevGroups) =>
          prevGroups.map((group) =>
            group.id === groupId
              ? {
                  ...group,
                  members: [
                    ...group.members,
                    { memberId: userId, memberType: userType },
                  ],
                  groupSize: group.groupSize * 1 + 1, // Increment group size
                }
              : group
          )
        );

        // If the selected group is the one being joined, update it as well
        if (selectedGroup?.id === groupId) {
          setSelectedGroup((prevGroup) =>
            prevGroup
              ? {
                  ...prevGroup,
                  members: [
                    ...prevGroup.members,
                    { memberId: userId, memberType: userType },
                  ],
                  groupSize: prevGroup.groupSize * 1 + 1, // Increment group size
                }
              : prevGroup
          );
        }
      }
    } catch (error) {
      console.error("Error joining group: ", error);
    }
  };

  const handleViewMore = (group: StudyGroup) => {
    if (group.groupType === "Public") {
      return navigate(`/group/${group.id}`);
    }
    if (!group.members.some((member) => member.memberId === user?.uid)) {
      setSelectedGroup(group);
    } else {
      navigate(`/group/${group.id}`);
    }
  };

  return (
    <div className="bg-white text-black min-h-screen p-6">
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
            <p className="text-gray-600 mt-1">Members: {group.groupSize}</p>
            <div className="mt-4 space-x-2">
              <button
                onClick={() => handleViewMore(group)}
                className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition"
              >
                View More
              </button>
              {!group.members.some(
                (member) => member.memberId === user?.uid
              ) && (
                <button
                  onClick={() => group.id && handleJoinGroup(group.id)}
                  className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition"
                >
                  Join
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center mt-6">
          <p className="text-yellow-600">Loading...</p>
        </div>
      )}

      {/* Popup for Group Details */}
      {selectedGroup && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-yellow-600 rounded-lg p-6 shadow-2xl w-11/12 max-w-md max-h-[80vh] overflow-y-auto">
          {/* Group Image and Join Button */}
          <div className="flex items-center justify-between mb-4">
            {/* Group Image */}
            <div className="flex justify-center flex-1">
              <img
                src={"https://picsum.photos/200"} // Use a dummy image if groupImage is not provided
                alt={selectedGroup.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            </div>

            {/* Join Button */}
            {!selectedGroup.members.some(
              (member) => member.memberId === user?.uid
            ) && (
              <button
                onClick={() =>
                  selectedGroup.id && handleJoinGroup(selectedGroup.id)
                }
                className="bg-yellow-600 text-white font-semibold uppercase text-sm px-4 py-2 rounded hover:bg-yellow-700 transition"
              >
                Join
              </button>
            )}
          </div>

          {/* Group Name */}
          <h2 className="text-2xl font-semibold text-yellow-600 text-center">
            {selectedGroup.name} ({selectedGroup.members.length})
          </h2>

          {/* Description */}
          <p className="text-gray-700 mt-2 ">{selectedGroup.description}</p>

          {/* Category and Group Type */}
          <div className="flex text-sm justify-between uppercase text-yellow-600 my-2 font-bold">
            <p>{selectedGroup.category}</p>
            <p>{selectedGroup.groupType}</p>
          </div>

          {/* Rules */}
          <div className="text-gray-600 mt-3">
            <span className="font-semibold underline">Rules</span>
            <ul>
              {selectedGroup.rules.map((rule, index) => (
                <li className="list-none my-1" key={index}>
                  {rule}
                </li>
              ))}
            </ul>
          </div>

          {/* Tags */}
          <div className="text-gray-600 mt-2">
            <div className="flex flex-wrap gap-2 mt-1">
              {selectedGroup.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-yellow-600 text-white px-2 py-1 rounded text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Close Button */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setSelectedGroup(null)}
              className="bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
