import React, { useEffect, useState, useContext } from "react";
import {
  createUserPost,
  fetchUserFeed,
} from "../util/firebase/firebaseServices";
import { AuthContext } from "../util/context/authContext";
import { Post, User } from "../util/types";
import PostImage from "../components/postImage";
import profile from "../util/images/profile.jpg";
import { toggleLikePost } from "../util/firebase/services/group";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../components/loadingScreen";
import {
  acceptFriendRequest,
  fetchFriends,
  fetchSuggestions,
  getReceivedRequests,
  rejectFriendRequest,
  removeFriend,
} from "../util/firebase/services/friends";
import { auth, db } from "../util/firebase/firebase";
import FriendsList from "../components/FriendsList";
import SuggestionsList from "../components/SuggestionsList";
import FriendRequests from "../components/recievedRequests";
import CreatePostModal from "../components/CreatePostModal";
import CreatePost from "../components/createPost";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "@firebase/firestore";

const UserFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [friendsLoading, setFriendsLoading] = useState<boolean>(true);
  const { user } = useContext(AuthContext) ?? { user: null };
  const [likeAdded, setlikeAdded] = useState(false);
  const navigate = useNavigate();
  const [postAdded, setPostAdded] = useState(false);

  const [friends, setFriends] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const userId = auth.currentUser?.uid;

  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);

  useEffect(() => {
    if (userId) {
      setFriendsLoading(true);
      Promise.all([
        fetchFriends(userId),
        fetchSuggestions(userId),
        getReceivedRequests(userId, 10),
      ])
        .then(([friendsData, suggestionsData, receivedRequestsData]) => {
          setFriends(friendsData);
          setSuggestions(suggestionsData);
          setReceivedRequests(receivedRequestsData);
          setFriendsLoading(false);
        })
        .catch((err) => {
          setError("Failed to load data");
          setLoading(false);
          console.error(err);
        });
    }
  }, [userId]);

  const handleAddFriend = async (friend: User) => {
    try {
      if (!userId || !friend.id) return;

      const { id, name } = friend;

      await acceptFriendRequest(userId, id);

      try {
        const notification = {
          authorId: user?.uid,
          timestamp: serverTimestamp(),
          link: null,
          message: `${name} accepted your friend request`,
          read: false,
        };

        const notifRef = collection(db, "users", id, "notifications");
        await addDoc(notifRef, notification);
      } catch (error) {
        console.log(error);
      }

      setReceivedRequests((prev) => prev.filter((user) => user.id !== id));

      setFriends((prevFriends) => {
        const newFriend = receivedRequests.find((user) => user.id === id);
        return newFriend ? [...prevFriends, newFriend] : prevFriends;
      });
    } catch (error) {
      console.error("Failed to add friend:", error);
    }
  };

  const handleRejectFriendRequest = async (friend: User) => {
    try {
      if (!userId || !friend.id) return;

      const { id, name } = friend;

      await rejectFriendRequest(id, userId);

      try {
        const notification = {
          authorId: userId,
          timestamp: serverTimestamp(),
          link: null,
          message: `${name} rejected your friend request`,
          read: false,
        };

        const notifRef = collection(db, "users", id, "notifications");
        await addDoc(notifRef, notification);
      } catch (error) {
        console.log(error);
      }

      setReceivedRequests((prev) => prev.filter((user) => user.id !== id));

      setSuggestions((prevFriends) => {
        const newFriend = suggestions.find((user) => user.id === id);
        return newFriend ? [...prevFriends, newFriend] : prevFriends;
      });
    } catch (error) {
      console.error("Failed to add friend:", error);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    try {
      if (!userId) return;

      await removeFriend(userId, friendId);
      setFriends((prev) => prev.filter((user) => user.id !== friendId));
      const removedFriend = friends.find((user) => user.id === friendId);
      if (removedFriend) setSuggestions((prev) => [...prev, removedFriend]);
    } catch (error) {
      console.error("Failed to remove friend:", error);
    }
  };

  const loadFeed = async () => {
    if (!user?.uid) return;
    setLoading(true);
    const userFeed = await fetchUserFeed(user.uid);
    setPosts(userFeed);
    setLoading(false);
  };

  useEffect(() => {
    loadFeed();
  }, [postAdded]);

  useEffect(() => {}, [user?.uid]);

  const handlePostLike = async (
    type: "user" | "group",
    postId: string,
    groupId: string
  ) => {
    setlikeAdded(false);
    if (groupId && user && postId)
      await toggleLikePost(type, groupId, postId, user.uid);
    setlikeAdded(true);
  };

  const handlePost = async (post: Post) => {
    setPostAdded(false);

    const { title, description, file } = post;
    if (user && user) {
      await createUserPost(user.uid, {
        title,
        description,
        file: file,
        uploadedBy: user.uid,
        type: "user",
      });

      setIsModalOpen(false);
      setPostAdded(true);
    }
  };

  return (
    <>
      {loading && (
        <>
          <LoadingScreen />
        </>
      )}
      <div className="container mx-auto p-6 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white text-black p-6 lg:col-span-2 order-2 lg:order-1">
            <div className="space-y-6">
              <section className="text-center mb-6 sm:mb-12">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-yellow-500 mb-2 sm:mb-4">
                  Welcome to the Virtual Study Group Platform
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Collaborate, learn, and grow with students around the world.
                </p>
              </section>
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Create a post..."
                  onClick={() => {
                    setIsModalOpen(true);
                  }}
                  className="w-full p-2 border focus:outline-none text-black border-yellow-500 rounded-lg"
                  readOnly
                />
                {user?.uid && (
                  <CreatePostModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                  >
                    <CreatePost
                      handlePost={handlePost}
                      groupId={user.uid}
                      type="user"
                    />
                  </CreatePostModal>
                )}
              </div>
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <li className="text-black mb-2 flex items-center">
                    <img
                      src={profile}
                      alt="profile"
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <span className="font-bold">{post.userName}</span>
                  </li>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">
                    {post.title}
                  </h3>
                  <p className="text-gray-700 mb-4">{post.description}</p>

                  {post.file && (
                    <a
                      href={`${
                        post.type === "user"
                          ? `/user/${post.uploadedBy}/post/${post.id}`
                          : `/group/${post.groupId}/post/${post.id}`
                      }`}
                      className="mb-4"
                    >
                      <PostImage file={post.file} from="feed" />
                    </a>
                  )}

                  <div className="flex space-x-4 text-gray-600">
                    <button
                      className="flex items-center space-x-2 hover:text-yellow-500 transition-colors duration-200"
                      onClick={() =>
                        post.groupId &&
                        post.id &&
                        post.type &&
                        handlePostLike(post.type, post.id, post.groupId)
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{post.likes?.length || null}</span>
                    </button>
                    <button
                      className="flex items-center space-x-2 hover:text-yellow-500 transition-colors duration-200"
                      onClick={() =>
                        navigate(`/${post.groupId}/post/${post.id}`)
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {receivedRequests.length === 0 &&
          friends.length === 0 &&
          suggestions.length === 0 ? null : (
            <div className="order-1 lg:order-2 bg-white p-4 rounded-lg shadow-lg lg:col-span-1">
              {receivedRequests.length === 0 ? null : (
                <FriendRequests
                  users={receivedRequests}
                  limit={5}
                  showViewAll
                  onAddFriend={handleAddFriend}
                  onRejectRequest={handleRejectFriendRequest}
                  setRequests={setReceivedRequests}
                />
              )}

              {friends.length === 0 ? null : (
                <FriendsList
                  users={friends}
                  limit={5}
                  showViewAll
                  onRemoveFriend={handleRemoveFriend}
                  setFriends={setFriends}
                />
              )}

              {suggestions.length === 0 ? null : (
                <SuggestionsList
                  users={suggestions}
                  limit={5}
                  showViewAll
                  setSuggestion={setSuggestions}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserFeed;
