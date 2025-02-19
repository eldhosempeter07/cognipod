import { db } from "../util/firebase"; // Import your Firebase config
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
} from "firebase/firestore";
import { FeaturedStudyGroup, JoinGroup, StudyGroup, User } from "./types";

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
  const docRef = await addDoc(userRef, user);
  return docRef.id;
};

export const fetchStudyGroups = async (
  lastVisible = null
): Promise<{ groups: StudyGroup[]; lastVisible: any }> => {
  try {
    let q;
    if (lastVisible) {
      // Fetch the next 3 groups after the last visible document
      q = query(
        collection(db, "studyGroups"),
        orderBy("createdAt", "asc"),
        startAfter(lastVisible),
        limit(3)
      );
    } else {
      // Fetch the first 3 groups
      q = query(collection(db, "studyGroups"), orderBy("createdAt"), limit(3));
    }

    const querySnapshot = await getDocs(q);

    // If no documents are returned, return empty groups and null for lastVisible
    if (querySnapshot.empty) {
      return { groups: [], lastVisible: null };
    }

    const groups: StudyGroup[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name || "",
      description: doc.data().description || "",
      category: doc.data().category || "",
      groupType: doc.data().groupType || "",
      members: doc.data().members || [],
      groupAdmin: doc.data().groupAdmin || "",
      meetingSchedule: doc.data().meetingSchedule || "",
      meetingLocation: doc.data().meetingLocation || "",
      goals: doc.data().goals || [],
      resources: doc.data().resources || [],
      discussionThreads: doc.data().discussionThreads || [],
      rules: doc.data().rules || [],
      progressTracking: doc.data().progressTracking || "",
      groupSize: doc.data().groupSize || 0,
      tags: doc.data().tags || [],
      groupImage: doc.data().groupImage || "",
      joinRequests: doc.data().joinRequests || [],
      activityFeed: doc.data().activityFeed || [],
      groupStatus: doc.data().groupStatus || "",
      createdAt: doc.data().createdAt || null,
      createdBy: doc.data().createdBy || "",
    }));

    // Return the groups and the last visible document for pagination
    return {
      groups,
      lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1],
    };
  } catch (error) {
    console.error("Error fetching study groups: ", error);
    throw error;
  }
};

// Join a study group
export const joinStudyGroup = async (user: JoinGroup) => {
  try {
    const { groupId, userId, userType } = user;
    const groupRef = doc(db, "studyGroups", groupId);
    await updateDoc(groupRef, {
      members: arrayUnion({ memberId: userId, memberType: userType }),
    });
  } catch (error) {
    console.error("Error joining study group: ", error);
    throw error;
  }
};
