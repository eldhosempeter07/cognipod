import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
  Timestamp,
  deleteDoc,
  setDoc,
  where,
  limit,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import {
  Comment,
  EditStudyGroup,
  JoinGroup,
  Member,
  Message,
  Post,
  SessionGroupInputs,
  StudyGroup,
} from "@/util/types";

export const fetchStudyGroups = async (
  page: number,
  limitPerPage: number,
  searchQuery?: string
): Promise<{ groups: StudyGroup[]; totalCount: number }> => {
  try {
    let q;

    if (searchQuery) {
      q = query(
        collection(db, "studyGroups"),
        where("query_name", ">=", searchQuery.replace(/\s+/g, "").trim()),
        where(
          "query_name",
          "<=",
          searchQuery.replace(/\s+/g, "").trim() + "\uf8ff"
        ),
        orderBy("query_name", "asc"),
        limit(limitPerPage)
      );
    } else {
      q = query(
        collection(db, "studyGroups"),
        orderBy("createdAt", "asc"),
        limit(limitPerPage)
      );
    }

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { groups: [], totalCount: 0 };
    }

    const groups: StudyGroup[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name || "",
      description: doc.data().description || "",
      category: doc.data().category || "",
      groupType: doc.data().groupType || "",
      members:
        doc.data().members?.length === undefined
          ? []
          : doc.data().members || [],
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
      query_name: doc.data().query_name || "",
    }));

    const totalCountQuery = query(collection(db, "studyGroups"));
    const totalCountSnapshot = await getDocs(totalCountQuery);
    const totalCount = totalCountSnapshot.size;

    return {
      groups,
      totalCount,
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
      members: arrayUnion({
        memberId: userId,
        memberType: userType,
        joinDate: new Date(),
      }),
    });
  } catch (error) {
    console.error("Error joining study group: ", error);
    throw error;
  }
};

const fetchUserDetails = async (id: string) => {
  try {
    if (!id) {
      throw new Error("User ID is undefined");
    }

    const userRef = doc(db, "users", id);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        email: userData?.email || "",
        name: userData?.name || "",
        imageUrl: userData?.imageUrl || "",
      };
    } else {
      console.warn("User document does not exist for ID:", id);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
    return null;
  }
};

const enrichMembers = async (members: Member[]) => {
  if (members.length === 0) return;

  return Promise.all(
    members.map(async (member) => {
      const userDetails = await fetchUserDetails(member.memberId);
      return {
        ...member,
        ...(userDetails || {}),
      };
    })
  );
};

const enrichJoinRequests = async (joinRequests: JoinGroup[]) => {
  if (joinRequests.length === 0) return;

  return Promise.all(
    joinRequests.map(async (request) => {
      const userDetails = await fetchUserDetails(request.userId);
      return {
        ...request,
        ...(userDetails || {}), // Add user details if available
      };
    })
  );
};

export const fetchGroupDetails = async (
  groupId: string
): Promise<StudyGroup | null> => {
  const groupRef = doc(db, "studyGroups", groupId);
  const groupDoc = await getDoc(groupRef);

  if (!groupDoc.exists()) {
    return null;
  }

  const groupData = groupDoc.data();

  const membersWithDetails = await enrichMembers(groupData.members || []);
  const joinRequestsWithDetails = await enrichJoinRequests(
    groupData.joinRequests || []
  );

  return {
    id: groupDoc.id,
    name: groupData.name || "",
    description: groupData.description || "",
    category: groupData.category || "",
    groupType: groupData.groupType || "",
    members: membersWithDetails || [],
    groupAdmin: groupData.groupAdmin || "",
    goals: groupData.goals || [],
    resources: groupData.resources || [],
    discussionThreads: groupData.discussionThreads || [],
    rules: groupData.rules || [],
    groupSize: groupData.groupSize || 0,
    tags: groupData.tags || [],
    groupImage: groupData.groupImage || "",
    joinRequests: joinRequestsWithDetails || [],
    activityFeed: groupData.activityFeed || [],
    groupStatus: groupData.groupStatus || "",
    createdAt: groupData.createdAt || null,
    createdBy: groupData.createdBy || "",
    query_name: groupData.query_name || "",
  };
};

// Fetch real-time messages
export const subscribeToMessages = (
  groupId: string,
  callback: (messages: Message[]) => void
) => {
  const messagesRef = collection(db, "studyGroups", groupId, "messages");
  const q = query(messagesRef, orderBy("createdAt", "asc"));

  return onSnapshot(q, async (snapshot) => {
    const messagesList = snapshot.docs.map((doc) => ({
      id: doc.id,
      text: doc.data().text,
      userId: doc.data().userId,
      createdAt: doc.data().createdAt,
    }));

    // Fetch user details for each message
    const messagesWithUserDetails = await Promise.all(
      messagesList.map(async (message) => {
        const userRef = doc(db, "users", message.userId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();

          return {
            ...message,
            userName: userData.name || "", // Add name from user details
            userEmail: userData.email || "", // Add email from user details
          };
        }

        return message;
      })
    );

    callback(messagesWithUserDetails);
  });
};

// Send a new message
export const sendMessage = async (
  groupId: string,
  message: string,
  userId: string
) => {
  const messagesRef = collection(db, "studyGroups", groupId, "messages");
  await addDoc(messagesRef, {
    text: message,
    userId,
    createdAt: serverTimestamp(),
  });
};

// Upload a file
export const uploadFile = async (
  groupId: string,
  file: File,
  userId: string
) => {
  const fileRef = ref(storage, `studyGroups/${groupId}/files/${file.name}`);
  await uploadBytes(fileRef, file);

  // Add file metadata to Firestore
  const filesRef = collection(db, "studyGroups", groupId, "files");
  await addDoc(filesRef, {
    name: file.name,
    url: await getDownloadURL(fileRef),
    uploadedBy: userId,
    createdAt: serverTimestamp(),
  });
};

// Fetch files
export const fetchFiles = async (groupId: string) => {
  const filesRef = collection(db, "studyGroups", groupId, "files");
  const q = query(filesRef, orderBy("createdAt", "desc"));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name,
    url: doc.data().url,
    uploadedBy: doc.data().uploadedBy,
    createdAt: doc.data().createdAt,
  }));
};

export const createPost = async (
  groupId: string,
  post: Omit<Post, "id" | "createdAt">
) => {
  const postsRef = collection(db, "studyGroups", groupId, "posts");
  const doc = await addDoc(postsRef, {
    ...post,
    createdAt: serverTimestamp(),
  });
  return doc.id;
};

export const getPosts = async (groupId: string): Promise<Post[]> => {
  const postsRef = collection(db, "studyGroups", groupId, "posts");
  const q = query(postsRef, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);

  // Map through each post and fetch user details
  const postsWithUserDetails = await Promise.all(
    querySnapshot.docs.map(async (PostDoc) => {
      const postData = PostDoc.data();
      const userRef = doc(db, "users", postData.uploadedBy);
      const userDoc = await getDoc(userRef);

      let userName = "";
      let userEmail = "";

      if (userDoc.exists()) {
        const userData = userDoc.data();
        userName = userData.name || "";
        userEmail = userData.email || "";
      }

      return {
        id: PostDoc.id,
        ...postData,
        userName,
        userEmail,
      };
    })
  );

  return postsWithUserDetails as Post[];
};

export const fetchPost = async (
  type: string,
  parentId: string,
  postId: string
): Promise<Post | null> => {
  const postRef =
    type === "user"
      ? doc(db, `users/${parentId}/posts/${postId}`)
      : doc(db, `studyGroups/${parentId}/posts/${postId}`);

  const postSnapshot = await getDoc(postRef);

  if (!postSnapshot.exists()) {
    return null;
  }

  const postData = postSnapshot.data();

  // ✅ Fetch User Info
  const userRef = doc(db, "users", postData.uploadedBy);
  const userDoc = await getDoc(userRef);

  let userName = "Unknown";
  let userEmail = "";
  let imageUrl = null;

  if (userDoc.exists()) {
    const userData = userDoc.data();
    userName = userData.name || "Unknown";
    userEmail = userData.email || "";
    imageUrl = userData.imageUrl || null;
  }

  return {
    id: postSnapshot.id,
    ...postData,
    userName,
    userEmail,
    type,
    imageUrl,
  } as Post;
};

export const fetchComments = async (
  type: string,
  parentId: string,
  postId: string
): Promise<Comment[]> => {
  const commentsRef =
    type === "user"
      ? collection(db, `users/${parentId}/posts/${postId}/comments`)
      : collection(db, `studyGroups/${parentId}/posts/${postId}/comments`);

  const q = query(commentsRef, orderBy("createdAt", "desc"));

  try {
    const querySnapshot = await getDocs(q);

    const commentsData = await Promise.all(
      querySnapshot.docs.map(async (commentDoc) => {
        const commentData = commentDoc.data();

        const userRef = doc(db, "users", commentData.userId);
        const userDoc = await getDoc(userRef);

        let userName = "Unknown";
        let imageUrl = null;

        if (userDoc.exists()) {
          const userData = userDoc.data();
          userName = userData.name || "Unknown User";
          imageUrl = userData.imageUrl;
        }

        return {
          id: commentDoc.id,
          userName,
          imageUrl,
          text: commentData.text || "",
          userId: commentData.userId || "",
          createdAt: commentData.createdAt as Timestamp,
        };
      })
    );

    return commentsData;
  } catch (error) {
    console.error("Error fetching comments: ", error);
    return [];
  }
};

export const addCommentToPost = async (
  type: string,
  parentId: string,
  postId: string,
  userId: string,
  text: string
) => {
  try {
    const commentRef =
      type === "user"
        ? doc(collection(db, `users/${parentId}/posts/${postId}/comments`))
        : doc(
            collection(db, `studyGroups/${parentId}/posts/${postId}/comments`)
          );

    await setDoc(commentRef, {
      text,
      userId,
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error adding comment:", error);
  }
};

export const toggleLikePost = async (
  type: string,
  parentId: string,
  postId: string,
  userId: string
) => {
  try {
    const postRef =
      type === "user"
        ? doc(db, `users/${parentId}/posts/${postId}`)
        : doc(db, `studyGroups/${parentId}/posts/${postId}`);

    const postSnapshot = await getDoc(postRef);

    if (!postSnapshot.exists()) {
      return;
    }

    const postData = postSnapshot.data();
    const likes = postData.likes || [];

    if (likes.includes(userId)) {
      await updateDoc(postRef, { likes: arrayRemove(userId) });
    } else {
      await updateDoc(postRef, { likes: arrayUnion(userId) });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
  }
};

export const getUserGroups = async (
  userId: string
): Promise<SessionGroupInputs[]> => {
  try {
    const studyGroupsRef = collection(db, "studyGroups");
    const querySnapshot = await getDocs(studyGroupsRef);

    const groups: SessionGroupInputs[] = [];

    querySnapshot.forEach((doc) => {
      const members = doc.data().members;
      const isMember = members.some(
        (member: any) => member.memberId === userId
      );

      if (isMember) {
        groups.push({
          id: doc.id,
          name: doc.data().name,
        });
      }
    });

    return groups;
  } catch (error) {
    console.error("Error fetching user groups: ", error);
    throw new Error("Failed to fetch user groups. Please try again.");
  }
};

export const deleteGroup = async (groupId: string) => {
  try {
    const sessionRef = doc(db, "studyGroups", groupId);

    await deleteDoc(sessionRef);
  } catch (error) {
    console.error("Error deleting group:", error);
  }
};

export const uploadGroupCoverImage = async (groupName: string, file: File) => {
  const storageRef = ref(storage, `group-covers/${groupName}-${file.name}`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

export const editGroup = async (
  groupId: string,
  groupData: Partial<EditStudyGroup>
) => {
  const groupRef = doc(db, "studyGroups", groupId);

  // Convert the groupData object to a format compatible with Firestore
  const updateData: { [key: string]: any } = {};
  for (const [key, value] of Object.entries(groupData)) {
    updateData[key] = value;
  }

  await updateDoc(groupRef, updateData);
};

export const addJoinRequest = async (
  groupId: string,
  userId: string,
  userType: string
): Promise<void> => {
  const studyGroupRef = doc(db, "studyGroups", groupId);

  try {
    await updateDoc(studyGroupRef, {
      joinRequests: arrayUnion({ userId, userType }),
    });
  } catch (error) {
    throw new Error("Failed to add join request.");
  }
};

export const handleRejectRequest = async (
  groupId: string,
  userId: string,
  type: string
): Promise<void> => {
  const studyGroupRef = doc(db, "studyGroups", groupId);

  try {
    await updateDoc(studyGroupRef, {
      joinRequests: arrayRemove({ userId, userType: type }), //
    });
  } catch (error) {
    throw new Error("Failed to reject join request.");
  }
};

export const handleAcceptRequest = async (
  groupId: string,
  userId: string,
  type: string
): Promise<void> => {
  const studyGroupRef = doc(db, "studyGroups", groupId);

  try {
    await updateDoc(studyGroupRef, {
      members: arrayUnion({
        memberId: userId,
        memberType: "student",
        joinDate: new Date(),
      }),
      joinRequests: arrayRemove({ userId, userType: type }),
    });
  } catch (error) {
    throw new Error("Failed to accept join request.");
  }
};

export const updateGroupMembers = async (
  groupId: string,
  members: Member[]
) => {
  const groupRef = doc(db, "studyGroups", groupId);
  await updateDoc(groupRef, { members });
};

export const uploadGroupImage = async (groupId: string, file: File) => {
  const storageRef = ref(storage, `studyGroups/${groupId}/profile`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};

export const updateGroupImage = async (groupId: string, imageUrl: string) => {
  const groupRef = doc(db, "studyGroups", groupId);
  await updateDoc(groupRef, { groupImage: imageUrl });
};
