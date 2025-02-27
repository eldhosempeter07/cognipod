import { db, storage } from "./firebase"; // Import your Firebase config
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  Timestamp,
  limit as firestoreLimit,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { FeaturedStudyGroup, Member, Post, StudyGroup, User } from "../types";
import { getDownloadURL, ref, uploadBytes } from "@firebase/storage";
import { getFileExtension } from "../functions";

// Fetch all study groups
export const getStudyGroups = async () => {
  const studyGroupsRef = collection(db, "studyGroups");
  const querySnapshot = await getDocs(studyGroupsRef);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Fetch featured study groups

export const getFeaturedStudyGroups = async (
  userId: string
): Promise<FeaturedStudyGroup[]> => {
  const studyGroupsRef = collection(db, "studyGroups");
  const querySnapshot = await getDocs(studyGroupsRef);

  return querySnapshot.docs
    .filter((doc) => {
      const members = doc.data().members || [];
      return members.some((member: any) => member.memberId === userId);
    })
    .map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      description: doc.data().description,
    }));
};

export const addStudyGroup = async (groupData: StudyGroup) => {
  const studyGroupsRef = collection(db, "studyGroups");

  const q = query(studyGroupsRef, where("name", "==", groupData.name));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    throw new Error("A study group with the same name already exists.");
  }

  const docRef = await addDoc(studyGroupsRef, groupData);
  return docRef.id;
};

export const signUpUser = async (user: User) => {
  const userRef = collection(db, "users");

  // Check if user with same email exists
  const q = query(userRef, where("email", "==", user.email));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    throw new Error("User with this email already exists.");
  }

  const docRef = doc(userRef, user.id);

  await setDoc(docRef, { email: user.email, name: user.name?.toLowerCase() });

  return docRef.id;
};

// Fetch user profile data
export const fetchUserProfile = async (userId: string) => {
  const userDocRef = doc(db, "users", userId);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    return userDoc.data();
  } else {
    throw new Error("User profile not found");
  }
};

// Update user profile data
export const updateUserProfile = async (userId: string, data: any) => {
  console.log(data.file);

  const userDocRef = doc(db, "users", userId);
  await updateDoc(userDocRef, {
    ...data,
    path: data.file && `profileImages/${userId}.${getFileExtension(data.file)}`,
  });
};

// Upload profile image and return download URL
export const uploadProfileImage = async (userId: string, file: File) => {
  const storageRef = ref(storage, `profileImages/${userId}`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

// export const triggerGroupPostNotification = async (postData: PostData) => {
//   const {
//     groupId,
//     postId,
//     members,
//     authorId,

//     link,
//     postAuthorName,
//     groupName,
//   } = postData;
//   try {
//     const response = await fetch("http://localhost:3001/notify/newGroupPost", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         groupId,
//         postId,
//         members,
//         authorId,
//         postAuthorName,
//         groupName,
//         link,
//       }),
//     });
//     const result = await response.json();
//     console.log("Notification triggered:", result);
//   } catch (error) {
//     console.error("Error triggering notification:", error);
//   }
// };

export const markNotificationsAsRead = async (userId: string) => {
  if (!userId) {
    console.error("Error: userId is required.");
    return;
  }

  try {
    const notificationsRef = collection(db, "users", userId, "notifications");

    const q = query(notificationsRef, where("read", "==", false));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("No unread notifications to update.");
      return;
    }

    const updatePromises = querySnapshot.docs.map((docSnapshot) =>
      updateDoc(doc(db, "users", userId, "notifications", docSnapshot.id), {
        read: true,
      })
    );

    await Promise.all(updatePromises);

    console.log(
      `Marked ${querySnapshot.size} notifications as read for user: ${userId}`
    );
  } catch (error) {
    console.error("Error updating notifications:", error);
  }
};

export const fetchStudyGroupPosts = async (userId: string): Promise<Post[]> => {
  try {
    const studyGroupQuery = query(collection(db, "studyGroups"));
    const studyGroupSnapshot = await getDocs(studyGroupQuery);

    let studyGroupPosts: Post[] = [];

    for (const groupDoc of studyGroupSnapshot.docs) {
      const groupData = groupDoc.data();

      const isMember = (groupData.members as Member[])?.some(
        (member) => member.memberId === userId
      );

      if (isMember) {
        const postsQuery = query(
          collection(db, "studyGroups", groupDoc.id, "posts")
        );
        const postsSnapshot = await getDocs(postsQuery);

        for (const postDoc of postsSnapshot.docs) {
          const postData = postDoc.data();

          let userName = "Unknown";
          let userEmail = "";

          if (postData.uploadedBy) {
            const userRef = doc(db, "users", postData.uploadedBy);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
              const userData = userDoc.data();
              userName = userData.name || "Unknown";
              userEmail = userData.email || "";
            }
          }

          studyGroupPosts.push({
            id: postDoc.id,
            title: postData.title || "",
            description: postData.description || "",
            createdAt: postData.createdAt,
            userName,
            userEmail,
            type: "group",
            uploadedBy: postData.uploadedBy,
            file: postData.file || "",
            likes: postData.likes || [],
            groupId: groupDoc.id,
          });
        }
      }
    }

    return studyGroupPosts;
  } catch (error) {
    console.error("Error fetching study group posts:", error);
    return [];
  }
};

export const fetchUserAndFriendsPosts = async (
  userId: string
): Promise<Post[]> => {
  try {
    // Fetch the current user's posts
    const userPostsRef = collection(db, "users", userId, "posts");
    const userPostsQuery = query(userPostsRef, orderBy("createdAt", "desc"));
    const userPostsSnapshot = await getDocs(userPostsQuery);
    const userPosts = userPostsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Post[];

    const friendsRef = collection(db, "users", userId, "friends");
    const friendsSnapshot = await getDocs(friendsRef);
    const friendIds = friendsSnapshot.docs.map((doc) => doc.id);

    const friendPostsPromises = friendIds.map(async (friendId) => {
      const friendPostsRef = collection(db, "users", friendId, "posts");
      const friendPostsQuery = query(
        friendPostsRef,
        orderBy("createdAt", "desc")
      );
      const friendPostsSnapshot = await getDocs(friendPostsQuery);
      return friendPostsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
    });

    const friendPosts = (await Promise.all(friendPostsPromises)).flat();

    const allPosts = [...userPosts, ...friendPosts];

    const sortedPosts = allPosts.sort(
      (a, b) =>
        ((b.createdAt as Timestamp)?.toMillis() || 0) -
        ((a.createdAt as Timestamp)?.toMillis() || 0)
    );
    return sortedPosts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};
export const fetchUserFeed = async (userId: string): Promise<Post[]> => {
  if (!userId) {
    console.error("Error: userId is required.");
    return [];
  }

  try {
    const [studyGroupPosts, userPosts] = await Promise.all([
      fetchStudyGroupPosts(userId),
      fetchUserAndFriendsPosts(userId),
    ]);

    // Merge and sort posts by timestamp (latest first)
    const allPosts: Post[] = [...studyGroupPosts, ...userPosts];

    const sortedPosts = allPosts.sort(
      (a, b) =>
        ((b.createdAt as Timestamp)?.toMillis() || 0) -
        ((a.createdAt as Timestamp)?.toMillis() || 0)
    );

    // console.log(allPosts);

    return sortedPosts;
  } catch (error) {
    console.error("Error fetching user feed:", error);
    return [];
  }
};

export const searchUsers = async (
  currentUserId: string,
  searchTerm: string,
  excludeFriends: boolean = true,
  excludeSentRequests: boolean = true,
  limit: number = 10
): Promise<User[]> => {
  try {
    if (!searchTerm.trim()) return [];

    const searchLower = searchTerm.toLowerCase();

    const userRef = doc(db, "users", currentUserId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("User not found");
    }

    let friendIds: string[] = [];
    const sentRequests = excludeSentRequests
      ? userSnap.data().sentRequests || []
      : [];

    if (excludeFriends) {
      const friendsSnapshot = await getDocs(
        collection(db, `users/${currentUserId}/friends`)
      );
      friendIds = friendsSnapshot.docs.map((doc) => doc.id);
    }

    const excludedIds = new Set([currentUserId, ...friendIds, ...sentRequests]);

    const usersRef = collection(db, "users");
    const searchQuery = query(
      usersRef,
      where("name", ">=", searchLower),
      where("name", "<=", searchLower + "\uf8ff"),
      firestoreLimit(limit * 2)
    );

    const snapshot = await getDocs(searchQuery);

    const users = snapshot.docs
      .map(
        (doc) =>
          ({
            id: doc.id,
            name: doc.data().name,
            email: doc.data().email,
            imageUrl: doc.data().imageUrl,
            path: doc.data().path,
          } as User)
      )
      .filter((user) => !excludedIds.has(user.id));

    return users.slice(0, limit);
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
};

export const searchFriends = async (
  searchTerm: string,
  limit: number = 10,
  userId: string
) => {
  const searchLower = searchTerm.toLowerCase();
  const usersRef = collection(db, "users", userId, "friends");
  const snapshot = await getDocs(usersRef);

  const users = snapshot.docs
    .map((doc) => ({
      id: doc.id,
      name: doc.data().name || "Unknown",
      email: doc.data().email || "",
      imageUrl: doc.data().imageUrl || "",
      path: doc.data().path || "",
    }))
    .filter((user) => user.name.includes(searchLower))
    .slice(0, limit);

  return users;
};

export const createUserPost = async (
  userId: string,
  post: Omit<Post, "id" | "createdAt" | "userId">
): Promise<string> => {
  try {
    const userPostsRef = collection(db, "users", userId, "posts");

    const docRef = await addDoc(userPostsRef, {
      ...post,
      userId,
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating user post:", error);
    throw error;
  }
};
