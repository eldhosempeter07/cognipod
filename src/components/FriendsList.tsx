import React, { useEffect, useState } from "react";
import { User } from "../util/types";
import { fetchFriends } from "../util/firebase/services/friends";
import { auth } from "../util/firebase/firebase";
import { searchFriends } from "../util/firebase/firebaseServices";

interface FriendsListProps {
  users: User[];
  limit?: number;
  showViewAll?: boolean;
  onRemoveFriend?: (userId: string) => void;
  setFriends: (users: User[]) => void;
}

const FriendsList: React.FC<FriendsListProps> = ({
  users,
  limit = 5,
  showViewAll = true,
  onRemoveFriend,
  setFriends,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const currentUserId = auth.currentUser?.uid;

  const fetchUserFriends = async () => {
    if (!currentUserId) return;
    setIsSearching(true);
    try {
      const friends = await fetchFriends(currentUserId);
      setFriends(friends);
    } catch (error) {
      console.error("Failed to fetch friends:", error);
    }
    setIsSearching(false);
  };

  useEffect(() => {
    const searchUsersDebounced = async () => {
      if (!currentUserId || !searchTerm.trim()) return;

      setIsSearching(true);
      try {
        const results = await searchFriends(searchTerm, 5, currentUserId);
        setFriends(results);
      } catch (error) {
        console.error("Search failed:", error);
      }
      setIsSearching(false);
    };

    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        searchUsersDebounced();
      } else {
        fetchUserFriends();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, currentUserId]);

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className=" mb-4">
        <h3 className="text-xl font-semibold mb-3">Friends ({users.length})</h3>
        <input
          type="text"
          placeholder="Search friends..."
          className="p-2 border rounded-lg w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredUsers.slice(0, limit).map((user) => (
          <div
            key={user.id}
            className=" justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center">
              <img
                src={user.imageUrl || "/default-avatar.png"}
                alt={user.name || "Friend"}
                className="w-10 h-10 rounded-full mr-4"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/default-avatar.png";
                }}
              />
              <div>
                <p className="font-medium">{user.name || "Unknown User"}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            {onRemoveFriend && user.id && (
              <button
                onClick={() => user.id && onRemoveFriend(user.id)}
                className="bg-red-600 text-white hover:bg-red-800 mt-4 py-1 px-3 rounded-lg text-sm font-medium"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      {/* {showViewAll && users.length > limit && (
        <div className="mt-4 text-right">
          <a
            href="/friends"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            View All Friends →
          </a>
        </div>
      )} */}

      {filteredUsers.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          {searchTerm.trim() ? "No friends found" : "No friends available"}
        </div>
      )}
    </div>
  );
};

export default FriendsList;
