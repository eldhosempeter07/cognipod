import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchGroupDetails,
  handleAcceptRequest,
  handleRejectRequest,
} from "../util/firebase/services/group";
import { StudyGroup } from "../util/types";
import { AuthContext } from "../util/context/authContext";
import profile from "../util/images/profile.png";
import LoadingScreen from "../components/loadingScreen";

const JoinRequestsPage = () => {
  const { groupId } = useParams();
  const { user } = useContext(AuthContext) ?? { user: null };
  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [loading, setLoading] = useState(true);

  const loadGroupDetails = async () => {
    if (groupId) {
      const groupData = await fetchGroupDetails(groupId);
      setGroup(groupData);
      setLoading(false);
    }
  };

  // Fetch group details
  useEffect(() => {
    loadGroupDetails();
  }, [groupId]);

  if (loading) {
    return (
      <div>
        <LoadingScreen />
      </div>
    );
  }

  if (!group) {
    return <div>Group not found.</div>;
  }

  // Check if the user is an admin
  if (!user || !group.groupAdmin.includes(user.uid)) {
    return <div>You do not have permission to view join requests.</div>;
  }

  const handleReject = async (userId: string, type: string) => {
    if (!groupId) return;

    try {
      await handleRejectRequest(groupId, userId, type);
      // Refresh the group details after rejecting the request
      const updatedGroup = await fetchGroupDetails(groupId);
      setGroup(updatedGroup);
    } catch (error) {
      console.error("Failed to reject join request: ", error);
    }
  };

  const handleAccept = async (userId: string, type: string) => {
    if (!groupId) return;

    try {
      await handleAcceptRequest(groupId, userId, type);
      loadGroupDetails();
    } catch (error) {
      console.error("Failed to accept join request: ", error);
    }
  };

  return (
    <div className="p-6 mt-10">
      <h1 className="text-2xl tracking-tight font-bold mb-6">Join Requests</h1>
      {group.joinRequests.length === 0 ? (
        <div>No Requests Available</div>
      ) : (
        <ul className="space-y-4">
          {group.joinRequests.map((request, index) => (
            <li key={index} className="p-8 border rounded-lg">
              <div className="">
                <div className="flex items-center space-x-4">
                  <img
                    src={request.imageUrl || profile}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">{request.name}</p>
                    <p className="mt-2 text-gray-600">{request.email}</p>
                  </div>
                </div>
              </div>
              <div className="mt-5">
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded-lg mr-2"
                  onClick={() => handleAccept(request.userId, request.userType)}
                >
                  Accept
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-lg"
                  onClick={() => handleReject(request.userId, request.userType)}
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default JoinRequestsPage;
