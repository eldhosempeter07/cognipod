import React, { useEffect, useState } from "react";
import {
  fetchUserProfile,
  updateUserProfile,
  uploadProfileImage,
} from "../util/firebase/firebaseServices";
import { auth } from "../util/firebase/firebase";
import profileImg from "../util/images/profile.jpg";

const Profile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    college: "",
    phone: "",
    imageUrl: "",
    path: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const userId = auth.currentUser?.uid;

  // Fetch profile data on component mount
  useEffect(() => {
    if (userId) {
      setLoading(true);
      fetchUserProfile(userId)
        .then((data) => {
          setProfile({
            name: data.name || "",
            email: data.email || "",
            college: data.college || "",
            phone: data.phone || "",
            imageUrl: data.imageUrl || "",
            path: data.path || "",
          });
          setLoading(false);
        })
        .catch((err) => {
          setError("Failed to fetch profile data.");
          setLoading(false);
          console.error(err);
        });
    }
  }, [userId]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image upload
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userId) {
      try {
        setLoading(true);
        await updateUserProfile(userId, profile);
        setLoading(false);
        alert("Profile updated successfully!");
      } catch (err) {
        setError("Failed to update profile.");
        setLoading(false);
        console.error(err);
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Profile Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Image
          </label>
          <div className="flex items-center space-x-4">
            <img
              src={profile.imageUrl || profileImg}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="text-sm"
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
          <input
            type="text"
            id="name"
            name="name"
            value={profile.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={profile.email}
            disabled
            className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* College */}
        <div>
          <label
            htmlFor="college"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            College
          </label>
          <input
            type="text"
            id="college"
            name="college"
            value={profile.college}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300 disabled:bg-blue-300"
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
