import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchGroupDetails,
  subscribeToMessages,
  createPost,
  getPosts,
  toggleLikePost,
  deleteGroup,
  uploadGroupImage,
  updateGroupImage,
  addJoinRequest,
  joinStudyGroup,
} from "../util/firebase/services/group";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Message, Post, StudyGroup } from "../util/types";
import { AuthContext } from "../util/context/authContext";
import CreatePost from "../components/createPost";
import PostFeed from "../components/displayPost";
import CreatePostModal from "../components/CreatePostModal";
import Chat from "../components/chat";
import profile from "../util/images/profile.jpg";
import Popup from "../components/popup";
import { db } from "../util/firebase/firebase";

const GroupDetailsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);

  const { user, loading } = useContext(AuthContext) ?? {
    user: null,
    loading: true,
  };

  const { groupId } = useParams();
  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [messages, setMessages] = useState<Message[] | []>([]);
  const [postAdded, setPostAdded] = useState(false);
  const [likeAdded, setlikeAdded] = useState(false);
  const navigate = useNavigate();

  // Fetch group details
  useEffect(() => {
    const loadGroupDetails = async () => {
      if (groupId) {
        const groupData = await fetchGroupDetails(groupId);
        setGroup(groupData);
      }
    };

    loadGroupDetails();
  }, [groupId]);

  const fetchFeedPosts = async () => {
    if (postAdded || likeAdded) {
      await fetchPosts();
    }
  };

  useEffect(() => {
    fetchFeedPosts();
  }, [postAdded, likeAdded]);

  const fetchMessages = () => {
    if (groupId !== undefined) {
      subscribeToMessages(groupId, (messagesList) => {
        setMessages(messagesList);
      });
    }
  };

  const [posts, setPosts] = useState<Post[]>([]);
  const [postLoading, setPostLoading] = useState(false);

  const fetchPosts = async () => {
    setPostLoading(true);
    try {
      if (groupId) {
        const posts = await getPosts(groupId);
        setPosts(posts);
      }
    } catch (error) {
      console.error("Error fetching posts: ", error);
    } finally {
      setPostLoading(false);
    }
  };
  useEffect(() => {
    fetchPosts();
  }, [groupId]);

  // Subscribe to real-time messages
  useEffect(() => {
    fetchMessages();
  }, [groupId]);

  if (!group) {
    return <div>Loading...</div>;
  }

  const handlePost = async (post: Post) => {
    setPostAdded(false);

    const { title, description, file } = post;
    if (groupId && user) {
      const id = await createPost(groupId, {
        title,
        description,
        file: file,
        uploadedBy: user.uid,
      });

      const member = group.members.find(
        (member) => member.memberId === user?.uid
      );
      const memberName = member ? member.name : "User";
      setIsModalOpen(false);
      setPostAdded(true);

      try {
        const notification = {
          authorId: user?.uid,
          groupId: group.id,
          postAuthorName: memberName,
          postId: id,
          timestamp: serverTimestamp(),
          members: group.members,
          link: `/${groupId}/post/${id}`,
          groupName: group.name,
        };

        group.members.forEach(async (member) => {
          if (member.memberId === user.uid) return;
          const notifRef = doc(
            db,
            "users",
            member.memberId,
            "notifications",
            id
          );
          await setDoc(notifRef, notification);
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handlePostLike = async (type: "user" | "group", postId: string) => {
    setlikeAdded(false);
    if (groupId && user) {
      await toggleLikePost(type, groupId, postId, user.uid);
      setlikeAdded(true);
    }
  };

  const handleDeleteGroup = async () => {
    if (groupId) {
      await deleteGroup(groupId);
      navigate("/groups");
    }
  };

  const handleGroupImageUpdate = async (file: File) => {
    if (!groupId || !user || !group?.groupAdmin.includes(user.uid)) return;

    const imageUrl = await uploadGroupImage(groupId, file);

    await updateGroupImage(groupId, imageUrl);
    setGroup({ ...group, groupImage: imageUrl });
  };

  const handleJoinGroup = async (groupId: string, type: string) => {
    try {
      if (user?.uid !== undefined) {
        const userId = user?.uid;
        const userType = "member";

        if (type === "Private") {
          await addJoinRequest(groupId, userId, userType);
        } else {
          await joinStudyGroup({ groupId, userId, userType });
        }
        await fetchGroupDetails(groupId);
      }
    } catch (error) {
      console.error("Error joining group: ", error);
    }
  };

  const isUserMember =
    user && group.members.some((member) => member.memberId === user.uid);

  return (
    <div className="bg-white text-yellow-500 min-h-screen px-10 mb-10 pt-6 mt-12">
      <div className="w-full h-64 overflow-hidden relative">
        {group.groupImage && (
          <img
            src={group.groupImage}
            alt="cover"
            className="w-full h-full object-cover"
          />
        )}
        {user?.uid && group.groupAdmin.includes(user.uid) && (
          <label className="absolute bottom-2 right-2 bg-black/50 text-white px-3 py-1 rounded cursor-pointer hover:bg-black/70">
            Edit Photo
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleGroupImageUpdate(e.target.files[0]);
                }
              }}
            />
          </label>
        )}
      </div>

      {/* Group Name and Description */}
      <h1 className="text-4xl font-bold mb-6">{group.name}</h1>
      <p className="text-black mb-4">{group.description}</p>

      {/* Main Content */}
      {isUserMember ? (
        <div className="flex flex-col-reverse lg:flex-row gap-10 mt-6">
          <div className="flex-1">
            {user && group.groupAdmin.includes(user.uid) && (
              <div className="relative mb-3">
                <button
                  className="bg-black text-white px-4 py-2 rounded-lg"
                  onClick={() => setIsOptionModalOpen((prev) => !prev)}
                >
                  Options
                </button>
                {isOptionModalOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <button
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                      onClick={() => navigate(`/group/${groupId}/edit`)}
                    >
                      Edit
                    </button>
                    <button
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                      onClick={() => {
                        setIsDeletePopupOpen(true);
                        setIsOptionModalOpen(false);
                      }}
                    >
                      Delete
                    </button>
                    <button
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                      onClick={() => {
                        navigate(`/group/${groupId}/join-requests`);
                        setIsOptionModalOpen(false);
                      }}
                    >
                      Join Requests
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Create Post */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Create a post..."
                onClick={() => {
                  setIsModalOpen(true);
                  setIsOptionModalOpen(false);
                }}
                className="w-full p-2 border focus:outline-none text-black border-yellow-500 rounded-lg"
                readOnly
              />
              {groupId && (
                <CreatePostModal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                >
                  <CreatePost
                    groupId={groupId}
                    handlePost={handlePost}
                    type="group"
                  />
                </CreatePostModal>
              )}
            </div>

            {/* Post Feed */}
            {groupId && (
              <PostFeed
                groupId={groupId}
                postLoading={postLoading}
                posts={posts}
                handlePostLike={handlePostLike}
              />
            )}

            {/* Chat */}
            {groupId && user && (
              <Chat groupId={groupId} messages={messages} user={user} />
            )}
          </div>

          {/* Members Section */}
          <div className="w-full lg:w-1/4">
            <div className="md:p-4 p-1 rounded-lg">
              <div className="flex justify-between">
                <h2 className="text-2xl font-semibold mb-4">Members</h2>
                <a
                  href={`/group/${groupId}/members`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/group/${groupId}/members`);
                  }}
                  className="text-blue-500 text-sm hover:underline"
                >
                  View All
                </a>
              </div>
              <ul>
                {group.members.map((member, index) => (
                  <li key={index} className="text-black mb-2 flex items-center">
                    <img
                      src={member.profilePic || profile}
                      alt={`${member.name}'s profile`}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <span>
                      {member.name} {member.memberType === "Admin" && "(Admin)"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-left mt-3">
          <button
            disabled={
              user &&
              group.joinRequests.some((request) => request.userId === user?.uid)
                ? true
                : false
            }
            onClick={() => {
              if (group.groupType === "Private") {
                group.id && handleJoinGroup(group.id, group.groupType);
              }
            }}
            className="bg-yellow-600 disabled:bg-gray-400 text-white font-semibold uppercase text-sm px-4 py-2 rounded hover:bg-yellow-700 transition"
          >
            {group.groupType === "Private"
              ? user &&
                group.joinRequests.some(
                  (request) => request.userId === user?.uid
                )
                ? "Request Sent"
                : "Request To Join"
              : "Join"}
          </button>{" "}
        </div>
      )}

      {/* Delete Group Popup */}
      {isDeletePopupOpen && (
        <Popup
          onClose={() => setIsDeletePopupOpen(false)}
          onConfirm={handleDeleteGroup}
          heading="Delete Group"
          body={`Please enter ${group.name} to delete the group?`}
          buttonText="Delete Group"
          input={true}
          name={group.name}
        />
      )}
    </div>
  );
};

export default GroupDetailsPage;
