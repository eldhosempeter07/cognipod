import { Message, SessionData } from "@/util/types";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export const addSession = async (sessionData: SessionData): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "sessions"), sessionData);
    console.log("Session created with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error creating session: ", error);
    throw new Error("Failed to create session. Please try again.");
  }
};

export const getAllSessions = async (): Promise<SessionData[]> => {
  try {
    const sessionsRef = collection(db, "sessions");
    const querySnapshot = await getDocs(sessionsRef);

    const sessions: SessionData[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      sessions.push({
        id: doc.id,
        name: data.name,
        description: data.description,
        goals: data.goals,
        type: data.type,
        privacy: data.privacy,
        selectedGroup: data.selectedGroup,
        createdBy: data.createdBy,
        createdDate: data.createdDate.toDate(),
        meetingDate: data.meetingDate.toDate(),
        moderator: data.moderator,
        collaborators: data.collaborators,
        password: data.password,
        status: data.status,
      });
    });

    return sessions;
  } catch (error) {
    console.error("Error fetching sessions: ", error);
    throw new Error("Failed to fetch sessions. Please try again.");
  }
};

// Fetch session details
export const fetchSession = async (sessionId: string) => {
  const sessionRef = doc(db, "sessions", sessionId);
  const sessionDoc = await getDoc(sessionRef);

  if (sessionDoc.exists()) {
    return sessionDoc.data() as SessionData;
  } else {
    throw new Error("Session not found");
  }
};

// Subscribe to session updates
export const subscribeToSession = (
  sessionId: string,
  callback: (data: any) => void
) => {
  const sessionRef = doc(db, "sessions", sessionId);

  return onSnapshot(sessionRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  });
};

// Update session code
export const updateSessionCode = async (sessionId: string, newCode: string) => {
  const sessionRef = doc(db, "sessions", sessionId);
  await updateDoc(sessionRef, { code: newCode });
};

// Add user to the joined array
export const addUserToSession = async (sessionId: string, userId: string) => {
  const sessionRef = doc(db, "sessions", sessionId);
  await updateDoc(sessionRef, {
    joined: arrayUnion(userId), // Add user to the joined array
  });
};

// Remove user from the joined array
export const removeUserFromSession = async (
  sessionId: string,
  userId: string
) => {
  const sessionRef = doc(db, "sessions", sessionId);
  await updateDoc(sessionRef, {
    joined: arrayRemove(userId), // Remove user from the joined array
  });
};

// Send a chat message
export const sendChatMessage = async (
  sessionId: string,
  message: { user: string; text: string }
) => {
  const chatRef = collection(db, "sessions", sessionId, "chat");
  await addDoc(chatRef, {
    ...message,
    timestamp: serverTimestamp(), // Add a timestamp to the message
  });
};

export const updateSessionStatus = async (
  sessionId: string,
  status: string
) => {
  try {
    const sessionRef = doc(db, "sessions", sessionId);

    await setDoc(sessionRef, { status }, { merge: true });

    console.log("Session status updated successfully!");
  } catch (error) {
    console.error("Error updating session status:", error);
    throw new Error("Failed to update session status.");
  }
};

// Subscribe to chat messages
export const subscribeToChat = (
  sessionId: string,
  callback: (messages: Message[]) => void
) => {
  const chatRef = collection(db, "sessions", sessionId, "chat");
  return onSnapshot(chatRef, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      text: doc.data().text,
      userId: doc.data().user,
      timestamp: doc.data().timestamp,
    }));
    callback(messages);
  });
};

export const deleteSession = async (sessionId: string) => {
  try {
    const sessionRef = doc(db, "sessions", sessionId);

    await deleteDoc(sessionRef);

    console.log("Session deleted successfully!");
  } catch (error) {
    console.error("Error deleting session:", error);
  }
};
