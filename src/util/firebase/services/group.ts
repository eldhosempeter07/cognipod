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
  startAfter,
  limit,
  arrayRemove,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import {
  Comment,
  JoinGroup,
  Member,
  Message,
  Post,
  StudyGroup,
} from "@/util/types";

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
    }));

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

export const fetchGroupDetails = async (
  groupId: string
): Promise<StudyGroup | null> => {
  const groupRef = doc(db, "studyGroups", groupId);
  const groupDoc = await getDoc(groupRef);

  if (groupDoc.exists()) {
    const groupData = groupDoc.data();

    // Fetch user details for each member
    const membersWithDetails = await Promise.all(
      groupData.members.map(async (member: Member) => {
        const userRef = doc(db, "users", member.memberId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          return {
            ...member,
            email: userData.email || "", // Add email from user details
            name: userData.name || "", // Add name from user details
          };
        }

        return member; // Return the member as-is if user details are not found
      })
    );

    return {
      id: groupDoc.id,
      name: groupData.name || "",
      description: groupData.description || "",
      category: groupData.category || "",
      groupType: groupData.groupType || "",
      members: membersWithDetails, // Use the updated members array with user details
      groupAdmin: groupData.groupAdmin || "",
      goals: groupData.goals || [],
      resources: groupData.resources || [],
      discussionThreads: groupData.discussionThreads || [],
      rules: groupData.rules || [],
      groupSize: groupData.groupSize || 0,
      tags: groupData.tags || [],
      groupImage: groupData.groupImage || "",
      joinRequests: groupData.joinRequests || [],
      activityFeed: groupData.activityFeed || [],
      groupStatus: groupData.groupStatus || "",
      createdAt: groupData.createdAt || null,
      createdBy: groupData.createdBy || "",
    };
  }

  return null;
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
        console.log(userDoc.exists());

        if (userDoc.exists()) {
          const userData = userDoc.data();

          return {
            ...message,
            userName: userData.name || "", // Add name from user details
            userEmail: userData.email || "", // Add email from user details
          };
        }
        console.log(message);

        return message; // Return the message as-is if user details are not found
      })
    );

    callback(messagesWithUserDetails); // Pass the updated messages list to the callback
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
  await addDoc(postsRef, {
    ...post,
    createdAt: serverTimestamp(),
  });
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

export const toggleLikePost = async (
  groupId: string,
  postId: string,
  userId: string
) => {
  const postRef = doc(db, `studyGroups/${groupId}/posts/${postId}`);

  try {
    const postSnapshot = await getDoc(postRef);
    const postData = postSnapshot.data();

    if (postData && postData.likes && postData.likes.includes(userId)) {
      // User already liked the post, so remove their like
      await updateDoc(postRef, {
        likes: arrayRemove(userId),
      });
      console.log("Like removed");
    } else {
      // User hasn't liked the post, so add their like
      await updateDoc(postRef, {
        likes: arrayUnion(userId),
      });
      console.log("Like added");
    }
  } catch (error) {
    console.error("Error toggling like: ", error);
  }
};

export const addCommentToPost = async (
  groupId: string,
  postId: string,
  userId: string,
  text: string
) => {
  const commentsRef = collection(
    db,
    `studyGroups/${groupId}/posts/${postId}/comments`
  );

  try {
    await addDoc(commentsRef, {
      userId,
      text,
      createdAt: serverTimestamp(),
    });
    console.log("Comment added successfully");
  } catch (error) {
    console.error("Error adding comment: ", error);
  }
};

export const fetchPost = async (
  groupId: string,
  postId: string
): Promise<Post | null> => {
  const postRef = doc(db, `studyGroups/${groupId}/posts/${postId}`);
  const postSnapshot = await getDoc(postRef);

  if (postSnapshot.exists()) {
    const postData = postSnapshot.data();

    // Fetch user details
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
      id: postSnapshot.id,
      ...postData,
      userName,
      userEmail,
    } as Post;
  } else {
    console.log("Post not found");
    return null;
  }
};

export const fetchComments = async (
  groupId: string,
  postId: string
): Promise<Comment[]> => {
  const commentsRef = collection(
    db,
    `studyGroups/${groupId}/posts/${postId}/comments`
  );
  const q = query(commentsRef, orderBy("createdAt", "desc")); // Order comments by date (newest first)

  try {
    const querySnapshot = await getDocs(q);

    // Map through each comment and fetch user details
    const commentsData = await Promise.all(
      querySnapshot.docs.map(async (commentDoc) => {
        const commentData = commentDoc.data();

        // Fetch user details
        const userRef = doc(db, "users", commentData.userId);
        const userDoc = await getDoc(userRef);

        let userName = "";

        if (userDoc.exists()) {
          const userData = userDoc.data();
          userName = userData.name || "Unknown User";
        }

        return {
          id: commentDoc.id,
          userName,
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
