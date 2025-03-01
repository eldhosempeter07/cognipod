import { User } from "@/util/types";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  writeBatch,
  arrayRemove,
  arrayUnion,
} from "firebase/firestore";

// Fetch user's friends
export const fetchFriends = async (userId: string): Promise<User[] | []> => {
  try {
    const friendsCol = collection(db, `users/${userId}/friends`);
    const snapshot = await getDocs(friendsCol);

    const friendIds = snapshot.docs.map((doc) => doc.id);

    if (friendIds.length === 0) return [];
    const usersCol = collection(db, "users");
    const userQuery = query(usersCol, where("__name__", "in", friendIds));
    const userSnapshot = await getDocs(userQuery);

    return userSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];
  } catch (error) {
    console.error("Error fetching friends:", error);
    throw error;
  }
};

export const fetchSuggestions = async (userId: string): Promise<User[]> => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("User not found");
    }

    const [friends, sentRequests] = await Promise.all([
      fetchFriends(userId),
      userSnap.data().sentRequests || [],
    ]);

    const friendIds = friends.map((friend) => friend.id);
    const excludedIds = [userId, ...friendIds, ...sentRequests];

    const usersCol = collection(db, "users");
    const userQuery = query(usersCol, where("__name__", "not-in", excludedIds));

    const snapshot = await getDocs(userQuery);
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          name: doc.data().name,
          email: doc.data().email,
          imageUrl: doc.data().imageUrl,
          path: doc.data().path,
        } as User)
    );
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    throw error;
  }
};

// export const addFriend = async (
//   userId: string,
//   friendId: string
// ): Promise<void> => {
//   try {
//     const batch = writeBatch(db);

//     const userFriendRef = doc(db, `users/${userId}/friends/${friendId}`);
//     batch.set(userFriendRef, { timestamp: new Date() });

//     const friendUserRef = doc(db, `users/${friendId}/friends/${userId}`);
//     batch.set(friendUserRef, { timestamp: new Date() });

//     await batch.commit();
//   } catch (error) {
//     console.error("Error adding friend:", error);
//     throw error;
//   }
// };

export const removeFriend = async (
  userId: string,
  friendId: string
): Promise<void> => {
  try {
    const batch = writeBatch(db);

    // Remove from current user's friends
    const userFriendRef = doc(db, `users/${userId}/friends/${friendId}`);
    batch.delete(userFriendRef);

    // Remove from friend's friends list
    const friendUserRef = doc(db, `users/${friendId}/friends/${userId}`);
    batch.delete(friendUserRef);

    await batch.commit();
  } catch (error) {
    console.error("Error removing friend:", error);
    throw error;
  }
};

export const checkFriendship = async (
  userId: string,
  friendId: string
): Promise<boolean> => {
  try {
    const friendRef = doc(db, `users/${userId}/friends/${friendId}`);
    const docSnap = await getDoc(friendRef);
    return docSnap.exists();
  } catch (error) {
    console.error("Error checking friendship:", error);
    return false;
  }
};

export const sendFriendRequest = async (
  senderId: string,
  receiverId: string
): Promise<void> => {
  try {
    const batch = writeBatch(db);

    const senderRef = doc(db, "users", senderId);
    batch.update(senderRef, {
      sentRequests: arrayUnion(receiverId),
    });

    const receiverRef = doc(db, "users", receiverId);
    batch.update(receiverRef, {
      receivedRequests: arrayUnion(senderId),
    });

    await batch.commit();
  } catch (error) {
    console.error("Error sending friend request:", error);
    throw error;
  }
};

export const rejectFriendRequest = async (
  senderId: string,
  receiverId: string
): Promise<void> => {
  try {
    const batch = writeBatch(db);

    const senderRef = doc(db, "users", senderId);
    batch.update(senderRef, {
      sentRequests: arrayRemove(receiverId),
    });

    const receiverRef = doc(db, "users", receiverId);
    batch.update(receiverRef, {
      receivedRequests: arrayRemove(senderId),
    });

    await batch.commit();
  } catch (error) {
    console.error("Error sending friend request:", error);
    throw error;
  }
};

export const acceptFriendRequest = async (
  userId: string,
  requesterId: string
): Promise<void> => {
  try {
    const batch = writeBatch(db);

    const userRef = doc(db, "users", userId);
    const requesterRef = doc(db, "users", requesterId);

    const userSnap = await getDoc(userRef);
    const requesterSnap = await getDoc(requesterRef);

    if (!userSnap.exists() || !requesterSnap.exists()) {
      throw new Error("One of the users does not exist.");
    }

    const userData = userSnap.data();
    const requesterData = requesterSnap.data();

    batch.update(userRef, { receivedRequests: arrayRemove(requesterId) });
    batch.update(requesterRef, { sentRequests: arrayRemove(userId) });

    const userFriendRef = doc(db, `users/${userId}/friends/${requesterId}`);
    const requesterFriendRef = doc(
      db,
      `users/${requesterId}/friends/${userId}`
    );

    batch.set(userFriendRef, {
      name: requesterData.name || "Unknown",
      email: requesterData.email || "",
      timestamp: new Date(),
    });

    batch.set(requesterFriendRef, {
      name: userData.name || "Unknown",
      email: userData.email || "",
      imageUrl: userData.imageUrl,
      timestamp: new Date(),
    });

    await batch.commit();
  } catch (error) {
    console.error("Error accepting friend request:", error);
    throw error;
  }
};

export const getReceivedRequests = async (
  userId: string,
  limit = 5
): Promise<any[]> => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return [];

    const receivedIds = userSnap.data().receivedRequests?.slice(0, limit) || [];

    if (receivedIds.length === 0) return [];

    const usersQuery = query(
      collection(db, "users"),
      where("__name__", "in", receivedIds)
    );

    const snapshot = await getDocs(usersQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching received requests:", error);
    return [];
  }
};

export const getSentRequests = async (userId: string): Promise<string[]> => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    return userSnap.data()?.sentRequests || [];
  } catch (error) {
    console.error("Error fetching sent requests:", error);
    return [];
  }
};
