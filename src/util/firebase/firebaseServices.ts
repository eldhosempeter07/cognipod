import { db } from "./firebase"; // Import your Firebase config
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  doc,
  updateDoc,
  arrayUnion,
  limit,
  startAfter,
  orderBy,
  setDoc,
  getDoc,
  arrayRemove,
} from "firebase/firestore";
import { FeaturedStudyGroup, JoinGroup, StudyGroup, User } from "../types";

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
  //   const q = query(studyGroupsRef, where("featured", "==", true)); // Example query
  const querySnapshot = await getDocs(studyGroupsRef);

  //   const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name,
    description: doc.data().description,
    featured: doc.data().featured,
  }));
};

// Add a new study group
export const addStudyGroup = async (groupData: StudyGroup) => {
  const studyGroupsRef = collection(db, "studyGroups");
  const docRef = await addDoc(studyGroupsRef, groupData);
  return docRef.id; // Return the ID of the newly created group
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
