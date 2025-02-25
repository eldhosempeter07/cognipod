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
} from "firebase/firestore";
import { FeaturedStudyGroup, StudyGroup, User } from "../types";
import { getDownloadURL, ref, uploadBytes } from "@firebase/storage";
import { getFileExtension } from "../functions";

// Fetch all study groups
export const getStudyGroups = async () => {
  const studyGroupsRef = collection(db, "studyGroups");
  const querySnapshot = await getDocs(studyGroupsRef);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Fetch featured study groups
export const getFeaturedStudyGroups = async (): Promise<
  FeaturedStudyGroup[]
> => {
  const studyGroupsRef = collection(db, "studyGroups");
  const querySnapshot = await getDocs(studyGroupsRef);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name,
    description: doc.data().description,
    featured: doc.data().featured,
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
