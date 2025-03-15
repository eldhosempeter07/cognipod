import React, { useContext, useState } from "react";
import { AuthContext } from "../util/context/authContext";
import { auth } from "../util/firebase/firebase";
import NotificationIcon from "./notificationIcon";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { user } = useContext(AuthContext) ?? { user: null };
  const [profileOpen, setProfileOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeAllDropdowns = () => {
    setProfileOpen(false);
    setSessionOpen(false);
    setGroupOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <a
            href="/"
            className="ml-2 text-xl text-yellow-400 hover:text-yellow-500 font-bold"
          >
            CogniPod
          </a>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="text-gray-700 focus:outline-none"
          >
            {/* Custom Hamburger Icon */}
            <div className="space-y-1">
              <span className="block w-6 h-0.5 bg-gray-700"></span>
              <span className="block w-6 h-0.5 bg-gray-700"></span>
              <span className="block w-6 h-0.5 bg-gray-700"></span>
            </div>
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          {renderMenuItems()}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="container mx-auto px-4 py-3 flex flex-col space-y-4">
            {renderMenuItems(true)}
          </div>
        </div>
      )}
    </header>
  );

  function renderMenuItems(isMobile = false) {
    return (
      <>
        {user ? (
          <>
            {/* Group Dropdown */}
            <div className={`relative ${isMobile ? "w-full" : "group"}`}>
              <h3
                className="text-gray-700 cursor-pointer transition-colors duration-200"
                onClick={() => {
                  setGroupOpen((prev) => !prev);
                  setProfileOpen(false);
                  setSessionOpen(false);
                  setNotificationOpen(false);
                }}
              >
                Group
              </h3>
              {groupOpen && (
                <div
                  className={`${
                    isMobile
                      ? "mt-2 w-full"
                      : "absolute right-[-4rem] top-[1.8rem] mt-2 w-32"
                  } bg-white border border-gray-200 rounded-lg shadow-lg duration-200`}
                >
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
              )}
            </div>

            {/* Session Dropdown */}
            <div className={`relative ${isMobile ? "w-full" : "group"}`}>
              <h3
                className="text-gray-700 cursor-pointer transition-colors duration-200"
                onClick={() => {
                  setSessionOpen((prev) => !prev);
                  setProfileOpen(false);
                  setGroupOpen(false);
                  setNotificationOpen(false);
                }}
              >
                Session
              </h3>
              {sessionOpen && (
                <div
                  className={`${
                    isMobile
                      ? "mt-2 w-full"
                      : "absolute top-[1.8rem] right-[-4rem] mt-2 w-32"
                  } bg-white border border-gray-200 rounded-lg shadow-lg duration-200`}
                >
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
              )}
            </div>

            {/* Profile Dropdown */}
            <div className={`relative ${isMobile ? "w-full" : "group"}`}>
              <h3
                className="text-gray-700 cursor-pointer transition-colors duration-200"
                onClick={() => {
                  setProfileOpen((prev) => !prev);
                  setSessionOpen(false);
                  setGroupOpen(false);
                  setNotificationOpen(false);
                }}
              >
                Profile
              </h3>
              {profileOpen && (
                <div
                  className={`${
                    isMobile
                      ? "mt-2 w-full"
                      : "absolute top-[1.8rem] right-[-4rem] mt-2 w-32"
                  } bg-white border border-gray-200 rounded-lg shadow-lg duration-200`}
                >
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
              )}
            </div>

            {/* Logout */}
            <button
              onClick={() => {
                auth.signOut();
                navigate("/home");
              }}
              className="text-gray-700 hover:text-yellow-500 transition-colors duration-200"
            >
              Logout
            </button>

            {/* Notification Icon */}
            {user.uid && (
              <NotificationIcon
                userId={user.uid}
                setNotificationOpen={setNotificationOpen}
                notificationOpen={notificationOpen}
                closeAllDropdowns={closeAllDropdowns}
              />
            )}
          </>
        ) : (
          <a
            href="/signup"
            className="text-gray-700 hover:text-yellow-500 transition-colors duration-200"
          >
            Login
          </a>
        )}
      </>
    );
  }
};

export default Header;
