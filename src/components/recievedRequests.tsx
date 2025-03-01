import { User } from "@/util/types";
import React, { useState, useEffect } from "react";
import { auth } from "../util/firebase/firebase";
import { searchUsers } from "../util/firebase/firebaseServices";
import { getReceivedRequests } from "../util/firebase/services/friends";
import profile from "../util/images/profile.png";

interface SuggestionsListProps {
  limit?: number;
  showViewAll?: boolean;
  onAddFriend: (friend: User) => void;
  onRejectRequest: (friend: User) => void;
  users: User[];
  setRequests: (users: User[]) => void;
}

const FriendRequests: React.FC<SuggestionsListProps> = ({
  limit = 5,
  showViewAll = true,
  users,
  setRequests,
  onAddFriend,
  onRejectRequest,
}) => {
  const currentUserId = auth.currentUser?.uid;

  const handleAddFriend = async (friend: User) => {
    if (!friend) return;
    try {
      onAddFriend(friend);
    } catch (error) {
      console.error("Failed to send friend request:", error);
    }
  };

  const handleRejectRequest = async (friend: User) => {
    if (!friend) return;

    try {
      onRejectRequest(friend);
    } catch (error) {
      console.error("Failed to reject friend request:", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4">
        <h3 className="text-xl font-semibold">Friend Requests</h3>
      </div>

      {/* {isSearching && users ? (
        <div className="flex justify-center py-4">
          <span className="loading loading-spinner text-primary"></span>
        </div>
      ) : ( */}
      <div className="space-y-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex flex-col items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center w-full">
              <img
                src={user.imageUrl || profile}
                alt={user.name || "User"}
                className="w-10 h-10 rounded-full mr-4"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = profile;
                }}
              />
              <div className="flex-1">
                <p className="font-medium">{user.name || "Unknown User"}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            {user.id && (
              <div className="flex justify-between">
                <button
                  onClick={() => user.id && handleAddFriend(user)}
                  className="mt-3 w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-medium py-1 px-3 rounded-lg text-sm transition-colors"
                >
                  Accept
                </button>

                <button
                  onClick={() => user.id && handleRejectRequest(user)}
                  className="mt-3 w-full ml-2 sm:w-auto bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-3 rounded-lg text-sm transition-colors"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* {showViewAll && users.length > limit && (
        <div className="mt-4 text-right">
          <a
            href="/suggestions"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            View All Requests →
          </a>
        </div>
      )} */}
    </div>
  );
};

export default FriendRequests;
