import { AuthContext } from "../util/context/authContext";
import { getFeaturedStudyGroups } from "../util/firebaseServices";
import { FeaturedStudyGroup } from "../util/types";
import React, { useContext, useEffect, useState } from "react";

import { Link } from "react-router-dom";
const Home = () => {
  const { user, loading } = useContext(AuthContext) ?? {
    user: null,
    loading: true,
  };

  const [studyGroup, setStudyGroup] = useState<FeaturedStudyGroup[] | null>(
    null
  );

  const fetchStudyGroups = async () => {
    const featuredGroups: FeaturedStudyGroup[] = await getFeaturedStudyGroups();
    setStudyGroup(featuredGroups);
  };
  useEffect(() => {
    fetchStudyGroups();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-8">
      <div className="container mx-auto px-2 sm:px-4">
        <Link
          to="/signup"
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Sign Up / Login
        </Link>
        {/* Overview Section */}
        <section className="text-center mb-6 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-4">
            Welcome to the Virtual Study Group Platform
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Collaborate, learn, and grow with students around the world.
          </p>
        </section>

        {/* Search Bar */}
        <div className="mb-4 sm:mb-8">
          <input
            type="text"
            placeholder="Search study groups by topic, subject, or tags..."
            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          />
        </div>

        {user === null ? null : (
          <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 mb-6 sm:mb-12">
            <Link
              to={`/create-group/${user.uid}`}
              className="bg-blue-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-blue-600 transition duration-300 text-sm sm:text-base text-center"
            >
              Create a Group
            </Link>
            <Link
              to="/groups"
              className="bg-green-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-green-600 transition duration-300 text-sm sm:text-base text-center"
            >
              Join a Group
            </Link>
          </div>
        )}
        {/* Featured Study Groups */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
            Featured Study Groups
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {studyGroup !== null &&
              studyGroup.map((group) => (
                <div
                  key={group.id}
                  className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1 sm:mb-2">
                    {group.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {group.description}
                  </p>
                </div>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
