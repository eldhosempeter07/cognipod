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
  increment,
} from "firebase/firestore";
import {
  FeaturedStudyGroup,
  Member,
  PostData,
  StudyGroup,
  User,
} from "../types";
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
    throw new Error("User with this email already exists."); //
  }

  // Add new user if email is unique
  const docRef = doc(userRef, user.id);

  await setDoc(docRef, { email: user.email, name: user.name });

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

export const triggerGroupPostNotification = async (postData: PostData) => {
  const {
    groupId,
    postId,
    members,
    authorId,

    link,
    postAuthorName,
    groupName,
  } = postData;
  try {
    const response = await fetch("http://localhost:3001/notify/newGroupPost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        groupId,
        postId,
        members,
        authorId,
        postAuthorName,
        groupName,
        link,
      }),
    });
    const result = await response.json();
    console.log("Notification triggered:", result);
  } catch (error) {
    console.error("Error triggering notification:", error);
  }
};

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
