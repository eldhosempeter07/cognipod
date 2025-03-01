import React, { useEffect, useState } from "react";
import { auth } from "../util/firebase/firebase";
import FriendsList from "../components/FriendsList";
import SuggestionsList from "../components/SuggestionsList";
import {
  fetchFriends,
  fetchSuggestions,
} from "../util/firebase/services/friends";

const FriendsPage = () => {
  const [friends, setFriends] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (userId) {
      setLoading(true);
      Promise.all([fetchFriends(userId), fetchSuggestions(userId)])
        .then(([friendsData, suggestionsData]) => {
          setFriends(friendsData);
          setSuggestions(suggestionsData);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [userId]);

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <FriendsList
            users={friends}
            showViewAll={false}
            setFriends={setFriends}
          />
        </div>

        <div className="lg:col-span-1">
          <SuggestionsList
            setSuggestion={setSuggestions}
            users={suggestions}
            limit={5}
            showViewAll
          />
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;
