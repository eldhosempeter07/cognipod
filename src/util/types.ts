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
  // progressTracking: string; // Progress Tracking (e.g., "50% completed")
  groupSize: number; // Group Size (e.g., 10 members)
  createdAt: Timestamp | FieldValue;
  joinRequests: string[]; // List of user IDs requesting to join
  activityFeed: string[]; // Activity Feed (e.g., recent activities)
  members: Array<{ memberId: string; memberType: string }>;
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
}

export interface JoinGroup {
  groupId: string;
  userId: string;
  userType: string;
}
