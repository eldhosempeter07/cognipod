import { FieldValue, Timestamp } from "firebase/firestore";

export interface StudyGroup {
  id?: string; // Document ID from Firestore
  name: string; // Group Name
  description: string; // Description
  groupImage: string; // Group Image/Logo URL
  category: string; // Category/Topic
  rules: string[]; // Rules/Guidelines
  goals: string[]; // Goals/Objectives
  groupType: string; // Group Type (e.g., Public, Private)
  groupStatus: string; // Group Status (e.g., "Active", "Inactive")
  tags: string[]; // Tags/Keywords
  groupAdmin: string; // Group Admin/Owner ID
  resources: string[]; // Resources (e.g., links to documents)
  discussionThreads: string[]; // Discussion Threads (e.g., thread IDs)
  groupSize: number; // Group Size (e.g., 10 members)
  createdAt: Timestamp | FieldValue;
  joinRequests: string[]; // List of user IDs requesting to join
  activityFeed: string[]; // Activity Feed (e.g., recent activities)
  members: Member[];
  createdBy: string;
}

export interface FeaturedStudyGroup {
  id: string; // Document ID from Firestore
  name: string; // Name of the study group
  description: string; // Description of the study group
  featured?: boolean; // Optional field to indicate if the group is featured
}

export interface User {
  id?: string;
  name: string;
  email: string;
  path?: string;
  imageUrl?: string;
}

export interface JoinGroup {
  groupId: string;
  userId: string;
  userType: string;
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
  joinDate: Timestamp | FieldValue;
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
