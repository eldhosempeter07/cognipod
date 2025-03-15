import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  fetchUserProfile,
  updateUserProfile,
  uploadProfileImage,
} from "../util/firebase/firebaseServices";
import { auth, db } from "../util/firebase/firebase";
import profileImg from "../util/images/profile.png";
import FriendsList from "../components/FriendsList";
import SuggestionsList from "../components/SuggestionsList";
import {
  acceptFriendRequest,
  fetchFriends,
  fetchSuggestions,
  getReceivedRequests,
  rejectFriendRequest,
  removeFriend,
} from "../util/firebase/services/friends";
import FriendRequests from "../components/recievedRequests";
import { User } from "@/util/types";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "@firebase/firestore";
import { useFormik } from "formik"; // Import Formik
import * as Yup from "yup"; // Import Yup

interface UserProfile {
  id: string;
  name: string;
  email: string;
  college: string;
  phone: string;
  imageUrl: string;
  path: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile>({
    id: "",
    name: "",
    email: "",
    college: "",
    phone: "",
    imageUrl: "",
    path: "",
  });
  const [friends, setFriends] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const userId = auth.currentUser?.uid;

  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);

  useEffect(() => {
    if (userId) {
      getReceivedRequests(userId).then(setReceivedRequests);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      setLoading(true);
      Promise.all([
        fetchUserProfile(userId),
        fetchFriends(userId),
        fetchSuggestions(userId),
      ])
        .then(([profileData, friendsData, suggestionsData]) => {
          setProfile({
            id: userId,
            name: profileData.name || "",
            email: profileData.email || "",
            college: profileData.college || "",
            phone: profileData.phone || "",
            imageUrl: profileData.imageUrl || "",
            path: profileData.path || "",
          });
          setFriends(friendsData);
          setSuggestions(suggestionsData);
          setLoading(false);
        })
        .catch((err) => {
          setError("Failed to load data");
          setLoading(false);
          console.error(err);
        });
    }
  }, [userId]);

  // Yup validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    phone: Yup.string().matches(/^\d{10}$/, "Phone number must be 10 digits"),
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      name: profile.name,
      college: profile.college,
      phone: profile.phone,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (userId) {
        try {
          setLoading(true);
          await updateUserProfile(userId, { ...profile, ...values });
          setLoading(false);
          alert("Profile updated successfully!");
        } catch (err) {
          setError("Failed to update profile.");
          setLoading(false);
          console.error(err);
        }
      }
    },
  });

  const handleAddFriend = async (friend: User) => {
    try {
      if (!userId || !friend.id) return;

      const { id, name } = friend;

      await acceptFriendRequest(userId, id);

      try {
        const notification = {
          authorId: userId,
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && userId) {
      const file: File = e.target.files[0];

      try {
        setLoading(true);
        const imageUrl = await uploadProfileImage(userId, file);
        await updateUserProfile(userId, { imageUrl, file: file.name });
        setProfile((prev) => ({ ...prev, imageUrl }));
        setLoading(false);
      } catch (err) {
        setError("Failed to upload image.");
        setLoading(false);
        console.error(err);
      }
    }
  };

  return (
    <div className="container mx-auto p-6 mt-16">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Profile Section */}
        <div className="lg:col-span-3">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-6">
            <h2 className="text-2xl font-bold mb-6">Profile</h2>
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              {/* Profile Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Image
                </label>
                <div className="flex items-center space-x-4">
                  {loading ? (
                    <Skeleton circle height={64} width={64} />
                  ) : (
                    <img
                      src={profile.imageUrl || profileImg}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="text-sm"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Name
                </label>
                {loading ? (
                  <Skeleton height={40} />
                ) : (
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
                {formik.touched.name && formik.errors.name ? (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.name}
                  </div>
                ) : null}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </label>
                {loading ? (
                  <Skeleton height={40} />
                ) : (
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profile.email}
                    disabled
                    className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                )}
              </div>

              {/* College */}
              <div>
                <label
                  htmlFor="college"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  College
                </label>
                {loading ? (
                  <Skeleton height={40} />
                ) : (
                  <input
                    type="text"
                    id="college"
                    name="college"
                    value={formik.values.college}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
                {formik.touched.college && formik.errors.college ? (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.college}
                  </div>
                ) : null}
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone
                </label>
                {loading ? (
                  <Skeleton height={40} />
                ) : (
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
                {formik.touched.phone && formik.errors.phone ? (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.phone}
                  </div>
                ) : null}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition duration-300 disabled:bg-blue-300"
              >
                {loading ? "Updating..." : "Update Profile"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Section */}
        {loading ? (
          <div className="order-1 lg:order-2 bg-white p-4 rounded-lg shadow-lg lg:col-span-2">
            <Skeleton height={200} count={3} />
          </div>
        ) : receivedRequests.length === 0 &&
          friends.length === 0 &&
          suggestions.length === 0 ? null : (
          <div className="order-1 lg:order-2 bg-white p-4 rounded-lg shadow-lg lg:col-span-2">
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
  );
};

export default Profile;
