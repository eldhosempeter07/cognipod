import { FieldValue, Timestamp } from "firebase/firestore";

export interface StudyGroup {
  id?: string;
  name: string;
  description: string;
  groupImage: string;
  category: string;
  rules: string[];
  goals: string[];
  groupType: string;
  groupStatus: string;
  tags: string[];
  groupAdmin: string[];
  resources: string[];
  discussionThreads: string[];
  groupSize: number;
  createdAt: Timestamp | FieldValue;
  joinRequests: JoinGroup[];
  activityFeed: string[];
  members: Member[];
  createdBy: string;
}

export interface FeaturedStudyGroup {
  id: string; // Document ID from Firestore
  name: string; // Name of the study group
  description: string; // Description of the study group
  featured?: boolean; // Optional field to indicate if the group is featured
}

export interface EditStudyGroup {
  name: string;
  description: string;
  groupImage: string;
  category: string;
  rules: string[];
  goals: string[];
  groupType: string;
  groupStatus: string;
  tags: string[];
  resources: string[];
  groupSize: number;
  createdAt: Timestamp | FieldValue;
  activityFeed: string[];
}

export interface User {
  id?: string;
  name?: string;
  email: string | null;
  path?: string;
  imageUrl?: string;
}

export interface JoinGroup {
  groupId: string;
  userId: string;
  userType: string;
  email?: string;
  name?: string;
  imageUrl?: string;
}

export type Message = {
  id?: string;
  text: string;
  userId: string;
  createdAt?: Timestamp;
  timestamp?: Timestamp;
  userEmail?: string;
  userName?: string;
};

export type File = {
  id: string;
  name: string;
  url: string;
  uploadedBy: string;
  createdAt: Timestamp | FieldValue;
};

export type Member = {
  memberId: string;
  memberType: string;
  joinDate: Timestamp | FieldValue | Date;
  email?: string;
  name?: string;
  profilePic?: string;
};

export interface FileProp {
  name: string;
  url: string;
  path: string;
}

export interface Post {
  id?: string;
  title: string;
  description: string;
  file?: FileProp | null;
  uploadedBy: string;
  createdAt?: Timestamp | FieldValue;
  userEmail?: string;
  userName?: string;
  likes?: string[];
  comments?: Comment[];
}

export interface Comment {
  id: string;
  text: string;
  userId: string;
  createdAt?: Timestamp | FieldValue;
  userName?: string;
}

export interface SessionData {
  id?: string;
  name: string;
  description: string;
  goals: string;
  type: "text" | "in-person";
  privacy: "public" | "private";
  selectedGroup: string | null;
  password?: string | null;
  createdBy: string;
  createdDate: Date;
  meetingDate: Timestamp | Date;
  code?: string;
  output?: string;
  moderator: string;
  collaborators?: string[];
  status: string;
  joined?: string[];
}

export type SessionGroupInputs = {
  id: string;
  name: string;
};

export interface PostData {
  postId: string;
  authorId: string;
  postAuthorName: string;
  members: Member[];
  groupId?: string; // Optional if posts can be outside a group
  groupName: string; // Optional if posts can be outside a group
  timestamp: any; // Firestore timestamp
  link: string;
}
