import { useNavigate } from "react-router-dom";
import {
  deleteSession,
  getAllSessions,
  updateSessionStatus,
} from "../util/firebase/services/session";
import React, { useEffect, useState } from "react";
import { getTimeRemaining } from "../util/functions";
import SessionPasswordPopup from "../components/sessionPasswordPopup";
import { SessionData } from "../util/types";
import { auth } from "../util/firebase/firebase";
import { Timestamp } from "firebase/firestore";
import ExitSessionPopup from "../components/popup";

const SessionsPage: React.FC = () => {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [currentSession, setCurrentSession] = useState<SessionData | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [passwordPopup, setPasswordPopup] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const navigate = useNavigate();

  const user = auth.currentUser;
  const fetchSessions = async () => {
    try {
      const sessions = user?.uid && (await getAllSessions(user?.uid));
      if (sessions) setSessions(sessions);
    } catch (error) {
      setError("Failed to fetch sessions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  if (loading) {
    return <div>Loading sessions...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const handleJoinMeeting = (session: SessionData) => {
    if (session.privacy === "private") {
      setCurrentSession(session);
      return setPasswordPopup(true);
    }
    navigate(`/session/${session.id}`, { state: "fromJoin" });
  };

  const handleStartMeeting = async (session: SessionData) => {
    try {
      if (session.id) await updateSessionStatus(session.id, "Started");
      navigate(`/session/${session.id}`, { state: "fromJoin" });
    } catch (error) {
      console.error("Failed to start meeting:", error);
      setError("Failed to start meeting. Please try again.");
    }
  };

  const handlePasswordPopupClose = () => {
    setPasswordPopup(false);
  };

  const isMeetingTime = (meetingDate: Date | Timestamp): boolean => {
    const now = new Date();
    const meetingTime =
      meetingDate instanceof Timestamp
        ? meetingDate.toDate()
        : new Date(meetingDate);
    const nextDay = new Date(meetingTime);
    nextDay.setDate(meetingTime.getDate() + 1); // Next day after meeting

    return now >= meetingTime && now <= nextDay;
  };

  const handleDeletePopup = (session: SessionData) => {
    setCurrentSession(session);
    setIsPopupOpen(true);
  };

  const handleDeleteSession = async () => {
    currentSession?.id && (await deleteSession(currentSession?.id));
    setIsPopupOpen(false);
    fetchSessions();
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen mt-16">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">All Sessions</h1>
      {sessions.length === 0 ? (
        <div>
          <h3>No Sessions Available</h3>
        </div>
      ) : (
        sessions.map((session) => {
          const isModerator = user?.uid === session.moderator;
          const isMeetingActive = isMeetingTime(session.meetingDate);
          const isSessionEnded = session.status === "Ended";
          const isSessionStarted = session.status === "Started";
          const isSessionCreated = session.status === "Created";

          const timeRemaining = getTimeRemaining(session.meetingDate);

          return (
            <li
              key={session.id}
              className="p-6 mb-5 list-none bg-white rounded-lg  transition-shadow"
            >
              <div className="flex justify-between">
                <div className="flex">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    {session.name}
                  </h2>
                  {isSessionEnded ? (
                    <span className="text-red-500 text-lg px-3 py-1 rounded">
                      (Meeting Ended)
                    </span>
                  ) : null}
                </div>
                <div>
                  {!isSessionStarted && session.moderator === user?.uid ? (
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded"
                      onClick={() => session && handleDeletePopup(session)}
                    >
                      Delete
                    </button>
                  ) : null}
                  {isSessionEnded ? (
                    <button
                      className="bg-black text-white px-3 py-1 rounded ml-2"
                      onClick={() =>
                        session && navigate(`/session/${session.id}`)
                      }
                    >
                      View
                    </button>
                  ) : null}
                </div>
              </div>
              <p className="text-gray-600 mb-4">{session.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Type: <span className="text-gray-700">{session.type}</span>
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Privacy:{" "}
                    <span className="text-gray-700">{session.privacy}</span>
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Meeting Date:
                  </span>
                  <p className="text-gray-700">
                    {session.meetingDate instanceof Timestamp
                      ? session.meetingDate.toDate().toLocaleString()
                      : new Date(session.meetingDate).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Display time remaining */}
              {!isSessionEnded && !isMeetingActive && (
                <div className="mt-2">
                  <span className="text-sm text-gray-600">{timeRemaining}</span>
                </div>
              )}

              <div className="mt-4">
                {isSessionEnded ? null : isSessionCreated && !isModerator ? (
                  <span className="text-gray-600 px-3 py-1 rounded">
                    Waiting for moderator to start the meeting...
                  </span>
                ) : isMeetingActive && !isSessionEnded ? (
                  isModerator ? (
                    <button
                      onClick={() => handleStartMeeting(session)}
                      className="inline-block px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors"
                    >
                      {session.status === "Started" ? "Join" : "Start"} Meeting
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoinMeeting(session)}
                      className="inline-block px-4 py-2 bg-black text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Join Meeting
                    </button>
                  )
                ) : null}
              </div>
            </li>
          );
        })
      )}

      {passwordPopup && currentSession ? (
        <SessionPasswordPopup
          onClose={handlePasswordPopupClose}
          session={currentSession}
        />
      ) : null}

      {isPopupOpen && (
        <ExitSessionPopup
          onClose={handleClosePopup}
          onConfirm={handleDeleteSession}
          heading="Delete Session"
          body="Are you sure you want to delete the session?"
          buttonText="Delete Session"
          input={false}
        />
      )}
    </div>
  );
};

export default SessionsPage;
