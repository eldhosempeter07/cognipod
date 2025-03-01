import React from "react";
import { motion } from "framer-motion";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 mt-28">
      <div className="container mx-auto px-2 sm:px-4">
        <section className="text-center mb-6 sm:mb-12 py-12">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-gray-800 mb-4 animate-fadeIn">
            Welcome to{" "}
            <span className="text-yellow-500 animate-pulse">CogniPod</span>
          </h1>
          <p className="text-sm sm:text-lg text-gray-600 mb-8 animate-slideIn">
            Collaborate, learn, and grow with students around the world.
          </p>

          <motion.div
            className="animate-bounceIn"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <a
              className="bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-yellow-600 transition duration-300"
              href="/signup"
            >
              Get Started
            </a>
          </motion.div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 animate-fadeInUp transform hover:scale-105">
            <div className="text-center">
              <div className="inline-block bg-yellow-100 p-4 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-yellow-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Collaborative Learning
              </h2>
              <p className="text-sm text-gray-600">
                Join study groups, share resources, and solve problems together.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 animate-fadeInUp delay-200 transform hover:scale-105">
            <div className="text-center">
              <div className="inline-block bg-purple-100 p-4 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-purple-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Global Community
              </h2>
              <p className="text-sm text-gray-600">
                Connect with students from around the world and expand your
                network.
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 animate-fadeInUp delay-400 transform hover:scale-105">
            <div className="text-center">
              <div className="inline-block bg-green-100 p-4 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Live Study Sessions
              </h2>
              <p className="text-sm text-gray-600">
                Join live study sessions, collaborate in real-time, and achieve
                your goals faster.
              </p>
            </div>
          </div>
        </section>

        <section className="text-center mb-12 animate-fadeIn">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8">
            What Our Users Say
          </h2>
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-1 rounded-lg shadow-lg inline-block">
            <div className="bg-white p-6 rounded-lg shadow-md max-w-lg">
              <p className="text-sm sm:text-base text-gray-600 italic">
                "CogniPod has transformed the way I study. The collaborative
                tools and global community make learning so much more engaging!"
              </p>
              <p className="text-sm text-gray-800 mt-4 font-semibold">
                – Sarah, University Student
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
