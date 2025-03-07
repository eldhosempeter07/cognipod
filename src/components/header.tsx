import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../util/context/authContext";
import { auth } from "../util/firebase/firebase";
import NotificationIcon from "./notificationIcon";

const Header = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext) ?? { user: null };
  const [profileOpen, setProfileOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          {/* <img src={logo} alt="Logo" className="h-10 w-auto" />{" "} */}
          <a
            href="/"
            className="ml-2 text-xl  text-yellow-400 hover:text-yellow-500 font-bold"
          >
            CogniPod
          </a>
        </div>

        <div className="flex items-center space-x-6">
          {user ? (
            <>
              <div className="relative group">
                <h3
                  className="text-gray-700 cursor-pointer transition-colors duration-200"
                  onClick={() => {
                    setGroupOpen((prev) => !prev);
                    profileOpen && setProfileOpen(false);
                    sessionOpen && setSessionOpen(false);
                  }}
                >
                  Group
                </h3>
                {groupOpen ? (
                  <div className="absolute right-[-4rem] top-[1.8rem] mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg duration-200">
                    <a
                      href={`/create-group/${user.uid}`}
                      className="block w-full   hover:text-yellow-500 px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Create
                    </a>
                    <a
                      href="/groups"
                      className="block w-full px-4 py-2  hover:text-yellow-500 text-gray-700 hover:bg-gray-100"
                    >
                      Groups
                    </a>
                  </div>
                ) : null}
              </div>
              <div className="relative group">
                <h3
                  className="text-gray-700 cursor-pointer transition-colors duration-200"
                  onClick={() => {
                    setSessionOpen((prev) => !prev);
                    profileOpen && setProfileOpen(false);
                    groupOpen && setGroupOpen(false);
                  }}
                >
                  Session
                </h3>
                {sessionOpen ? (
                  <div className="absolute  top-[1.8rem] right-[-4rem] mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg duration-200">
                    <a
                      href={`/create-session/${user.uid}`}
                      className="block w-full   hover:text-yellow-500 px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Create
                    </a>
                    <a
                      href="/sessions"
                      className="block w-full px-4 py-2  hover:text-yellow-500 text-gray-700 hover:bg-gray-100"
                    >
                      Sessions
                    </a>
                  </div>
                ) : null}
              </div>
              <div className="relative group">
                <h3
                  className="text-gray-700 cursor-pointer transition-colors duration-200"
                  onClick={() => {
                    setProfileOpen((prev) => !prev);
                    sessionOpen && setSessionOpen(false);
                  }}
                >
                  Profile
                </h3>
                {profileOpen ? (
                  <div className="absolute top-[1.8rem] right-[-4rem] mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg duration-200">
                    <a
                      href={`/profile/${user.uid}`}
                      className="block w-full   hover:text-yellow-500 px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      View Profile
                    </a>
                    <a
                      href="/settings"
                      className="block w-full px-4 py-2  hover:text-yellow-500 text-gray-700 hover:bg-gray-100"
                    >
                      Settings
                    </a>
                  </div>
                ) : null}
              </div>

              <a
                href="/"
                onClick={() => auth.signOut()}
                className="text-gray-700 hover:text-yellow-500 transition-colors duration-200"
              >
                Logout
              </a>
              {user.uid && <NotificationIcon userId={user.uid} />}
            </>
          ) : (
            <a
              href="/signup"
              className="text-gray-700 hover:text-yellow-500 transition-colors duration-200"
            >
              Login
            </a>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
