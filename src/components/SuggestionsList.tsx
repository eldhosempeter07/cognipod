import { User } from "@/util/types";
import React, { useState, useEffect } from "react";
import { auth, db } from "../util/firebase/firebase";
import { searchUsers } from "../util/firebase/firebaseServices";
import {
  fetchSuggestions,
  sendFriendRequest,
} from "../util/firebase/services/friends";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "@firebase/firestore";

interface SuggestionsListProps {
  limit?: number;
  showViewAll?: boolean;
  users: User[];
  setSuggestion: (users: User[]) => void;
}

const SuggestionsList: React.FC<SuggestionsListProps> = ({
  limit = 5,
  showViewAll = true,
  users,
  setSuggestion,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const currentUserId = auth.currentUser?.uid;

  const handleAddFriend = async (friend: User) => {
    const { id, name } = friend;
    if (!currentUserId || !id) return;
    try {
      await sendFriendRequest(currentUserId, id);
      setSuggestion(users.filter((user) => user.id !== id));

      try {
        const notification = {
          authorId: currentUserId,
          timestamp: serverTimestamp(),
          link: null,
          message: `${name} send you a friend request`,
          read: false,
        };

        const notifRef = collection(db, "users", id, "notifications");
        await addDoc(notifRef, notification);
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.error("Failed to send friend request:", error);
    }
  };

  const fetchUserSuggestion = async () => {
    if (!currentUserId) return;
    setIsSearching(true);
    try {
      const suggestions = await fetchSuggestions(currentUserId);
      setSuggestion(suggestions);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
    }
    setIsSearching(false);
  };

  useEffect(() => {
    const searchUsersDebounced = async () => {
      if (!currentUserId || !searchTerm.trim()) return;

      setIsSearching(true);
      try {
        const results = await searchUsers(currentUserId, searchTerm);
        setSuggestion(results);
      } catch (error) {
        console.error("Search failed:", error);
      }
      setIsSearching(false);
    };

    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        searchUsersDebounced();
      } else {
        fetchUserSuggestion();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, currentUserId]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4">
        <h3 className="text-xl font-semibold">Suggestions</h3>
        <input
          type="text"
          placeholder="Search suggestions..."
          className="p-2 border rounded-lg w-full mt-3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={!currentUserId}
        />
      </div>

      {isSearching ? (
        <div className="flex justify-center py-4">
          <span className="loading loading-spinner text-primary"></span>
        </div>
      ) : (
        <div className="space-y-4">
          {users.slice(0, limit).map((user) => (
            <div
              key={user.id}
              className="flex flex-col items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center w-full">
                <img
                  src={user.imageUrl || "/default-avatar.png"}
                  alt={user.name || "User"}
                  className="w-10 h-10 rounded-full mr-4"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/default-avatar.png";
                  }}
                />
                <div className="flex-1">
                  <p className="font-medium">{user.name || "Unknown User"}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              {user.id && (
                <button
                  onClick={() => handleAddFriend(user)}
                  className="mt-3 w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-1 px-3 rounded-lg text-sm transition-colors"
                >
                  Add Friend
                </button>
              )}
            </div>
          ))}

          {users.length === 0 && !isSearching && (
            <div className="text-center text-gray-500 py-4">
              {searchTerm.trim()
                ? "No users found"
                : "No suggestions available"}
            </div>
          )}
        </div>
      )}

      {showViewAll && users.length > limit && (
        <div className="mt-4 text-right">
          <a
            href="/suggestions"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            View All Suggestions →
          </a>
        </div>
      )}
    </div>
  );
};

export default SuggestionsList;
