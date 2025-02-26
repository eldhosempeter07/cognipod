import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  fetchSession,
  subscribeToSession,
  updateSessionCode,
  sendChatMessage,
  subscribeToChat,
  addUserToSession,
  updateSessionStatus,
} from "../util/firebase/services/session";
import CodeEditor from "../components/CodeEditor";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import { AuthContext } from "../util/context/authContext";
import ExitSessionPopup from "../components/popup";
import { Message, SessionData, User } from "../util/types";

import { doc, getDoc } from "firebase/firestore";
import { db } from "../util/firebase/firebase";
import profileImg from "../util/images/profile.jpg";

const SessionDetails: React.FC = () => {
  const { user } = useContext(AuthContext) ?? {
    user: null,
    loading: true,
  };
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newUserJoined, setNewUserJoined] = useState<string | null>(null);
  const [isNewUserJoined, setIsUserJoined] = useState<boolean>(false);
  const [newMessage, setNewMessage] = useState("");
  const [showTool, setShowTool] = useState<boolean>(false);
  const [joinedUsers, setJoinedUsers] = useState<User[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isSessionCreated, setIsSessionCreated] = useState(false);
  const [isSessionEnded, setIsSessionEnded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSessionEnded) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isSessionEnded) return;
      event.preventDefault();
      event.returnValue = "";
      return "Are you sure you want to leave? Your changes may not be saved.";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isSessionEnded]);

  const fetchUserNames = async (userIds: string[]) => {
    const users: User[] = [];
    for (const userId of userIds) {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        users.push({
          id: userId,
          name: userDoc.data().name,
          email: userDoc.data().email,
          imageUrl: userDoc.data().imageUrl,
        });
      }
    }
    setJoinedUsers(users);
  };

  useEffect(() => {
    if (!sessionId) return;

    const loadSession = async () => {
      try {
        const sessionData = await fetchSession(sessionId);
        setSession(sessionData);
        setLoading(false);
        setIsSessionCreated(sessionData.status === "Created");
        setIsSessionEnded(sessionData.status === "Ended");
        const userId = user?.uid;
        if (userId) {
          await addUserToSession(sessionId, userId);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        setLoading(false);
      }
    };

    loadSession();
    if (isSessionEnded) return;
    const unsubscribeSession = subscribeToSession(sessionId, async (data) => {
      setSession(data);

      if (data.joined && Array.isArray(data.joined)) {
        const newUsers = data.joined.filter(
          (userId: string) => !joinedUsers.some((user) => user.id === userId)
        );

        if (newUsers.length > 0) {
          setNewUserJoined(newUsers[0]);
          setIsUserJoined(true);

          await fetchUserNames(data.joined);
        }
      }
    });

    // Subscribe to chat messages
    const unsubscribeChat = subscribeToChat(sessionId, (messages) => {
      console.log(messages);

      setMessages(messages);
    });

    // Cleanup on unmount
    return () => {
      unsubscribeSession();
      unsubscribeChat();
    };
  }, [sessionId, joinedUsers, user]);

  // Handle new user joined notification timeout
  useEffect(() => {
    if (isNewUserJoined) {
      const timer = setTimeout(() => {
        setIsUserJoined(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isNewUserJoined]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && user && sessionId) {
      const message = { user: user.uid, text: newMessage };
      await sendChatMessage(sessionId, message);
      setNewMessage("");
    }
  };

  const handleCodeChange = async (newCode: string) => {
    if (location.state === "fromJoin") return;

    if (sessionId) {
      await updateSessionCode(sessionId, newCode);
    }
  };

  const handleExitSession = () => {
    setIsPopupOpen(true);
  };

  const handleConfirmExit = async () => {
    try {
      if (session?.moderator === user?.uid && sessionId) {
        await updateSessionStatus(sessionId, "Ended");
      }
      navigate("/sessions");
    } catch (error) {
      console.log(error);
    }
    setIsPopupOpen(false);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!session) {
    return <div className="p-4">Session not found</div>;
  }

  const setMessageUser = (id: string) => {
    const user = joinedUsers.filter((user) => user.id === id);
    return user[0];
  };

  return (
    <div className="mt-20">
      <div className="flex justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2 ml-8">{session.name}</h2>
          <p className="text-lg font-semibold mb-6 ml-8">
            {session.description}
          </p>
        </div>
        <div className="flex flex-wrap md:flex-row flex-col">
          {session && isSessionEnded ? (
            <div>
              <h3 className="mr-3 text-red-500 font-semibold mt-5 mb-3">
                Meeting Ended by Moderator
              </h3>
              <a
                href="/sessions"
                onClick={(e) => {
                  e.preventDefault();
                  window.onbeforeunload = null;
                  window.location.href = "/sessions";
                }}
                className="px-4 py-2 inline-block bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
              >
                Back To Sessions
              </a>
            </div>
          ) : (
            <div>
              <button
                onClick={handleExitSession}
                className="md:mr mr-4 md:mb-0 mb-4  px-6 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition duration-200"
              >
                {session.moderator === user?.uid ? "End Meeting" : "Exit"}
              </button>

              <button
                onClick={() => setShowTool((prev) => !prev)}
                className="bg-black text-white px-4  py-2  rounded"
              >
                {showTool ? ">>" : "<< Code"}
              </button>

              {isPopupOpen && (
                <ExitSessionPopup
                  onClose={handleClosePopup}
                  onConfirm={handleConfirmExit}
                  heading={`${
                    session.moderator === user?.uid ? "End" : "Leave"
                  } Session`}
                  body={`Are you sure you want to ${
                    session.moderator === user?.uid ? "end" : "leave"
                  } the session?`}
                  buttonText={`${
                    session.moderator === user?.uid ? "End" : "Leave"
                  } Session `}
                  input={false}
                />
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex md:flex-nowrap flex-wrap h-screen">
        <div
          className={`w-full ${
            showTool ? "md:w-1/2 w-full" : "w-full"
          } bg-white p-4 border-r border-gray-200`}
        >
          <div className="flex justify-between">
            <h2 className="text-lg font-semibold mb-6 ml-8">Chat</h2>
          </div>
          <div className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex-1 overflow-y-auto mb-4">
              {session.joined &&
                session.joined.length > 0 &&
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={` mx-10 mb-3 flex ${
                      message.userId === user?.uid
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`min-w-[15rem] pr-2 pl-3 rounded-lg shadow-sm ${
                        message.userId !== user?.uid
                          ? "bg-yellow-400 text-black py-5 "
                          : "bg-gray-200 text-black py-2"
                      }`}
                    >
                      <div
                        className={` ${
                          message.userId !== user?.uid ? "flex" : "hidden"
                        }`}
                      >
                        <img
                          src={
                            setMessageUser(message.userId)?.imageUrl ||
                            profileImg
                          }
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover mr-3"
                        />
                        <span className="font-semibold">
                          {setMessageUser(message.userId)?.name}
                        </span>
                      </div>
                      <p className="mt-2">{message.text}</p>
                      <span className="text-xs text-gray-600 block text-right mt-1">
                        {message.timestamp &&
                          new Date(
                            message.timestamp?.toDate()
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
            {isSessionEnded ? null : (
              <div className="flex">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 p-2 border border-gray-300 rounded"
                  placeholder="Type a message..."
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-500 text-white p-2 rounded ml-2"
                >
                  Send
                </button>
              </div>
            )}
          </div>
        </div>

        {showTool && (
          <div className="flex-1 flex flex-col">
            <ResizableBox
              width={600}
              height={400}
              minConstraints={[300, 200]}
              maxConstraints={[800, 600]}
              className="p-4 bg-white border-b border-gray-200"
            >
              <h2 className="text-lg font-semibold mb-4">Code Editor</h2>
              {sessionId && session && !isSessionEnded && user && (
                <CodeEditor
                  sessionId={sessionId}
                  initialCode={session.code ? session.code : ""}
                  onCodeChange={handleCodeChange}
                  userId={user.uid}
                />
              )}
            </ResizableBox>
          </div>
        )}

        {isSessionEnded
          ? null
          : isNewUserJoined &&
            newUserJoined !== user?.uid && (
              <div className="fixed bottom-4 right-4 bg-violet-500 text-white p-3 rounded-2xl shadow-lg">
                <p className="text-lg font-semibold">{newUserJoined} joined</p>
              </div>
            )}
      </div>
    </div>
  );
};

export default SessionDetails;
