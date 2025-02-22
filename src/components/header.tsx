import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../util/context/authContext";
import { auth } from "../util/firebase/firebase";

const Header = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext) ?? { user: null };
  const [profileOpen, setProfileOpen] = useState(false);
  const handleLogout = () => {
    auth.signOut();
    navigate("/");
  };

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
          <a
            href="/groups"
            className="text-gray-700 hover:text-yellow-500 transition-colors duration-200"
          >
            Groups
          </a>

          {user ? (
            <>
              {/* Profile Dropdown */}
              <div className="relative group">
                <h3
                  className="text-gray-700 cursor-pointer transition-colors duration-200"
                  onMouseOver={() => setProfileOpen(true)}
                  //   onMouseLeave={() => setProfileOpen(false)}
                >
                  Profile
                </h3>
                {profileOpen ? (
                  <div
                    onMouseLeave={() => setProfileOpen(false)}
                    className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg duration-200"
                  >
                    <a
                      href="/profile"
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

              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-yellow-500 transition-colors duration-200"
              >
                Logout
              </button>
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
