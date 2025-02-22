import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchGroupDetails,
  subscribeToMessages,
  createPost,
  getPosts,
  toggleLikePost,
} from "../util/firebase/services/group";
import { Message, Post, StudyGroup } from "../util/types";
import { AuthContext } from "../util/context/authContext";
import CreatePost from "../components/createPost";
import PostFeed from "../components/displayPost";
import CreatePostModal from "../components/CreatePostModal";
import Chat from "../components/chat";
import cover from "../util/images/js-cover.jpg";
import profile from "../util/images/profile.jpg";

const GroupDetailsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user, loading } = useContext(AuthContext) ?? {
    user: null,
    loading: true,
  };

  const { groupId } = useParams();
  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [messages, setMessages] = useState<Message[] | []>([]);
  const [postAdded, setPostAdded] = useState(false);
  const [likeAdded, setlikeAdded] = useState(false);

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
    if (groupId && user)
      await createPost(groupId, {
        title,
        description,
        file: file,
        uploadedBy: user.uid,
      });
    setIsModalOpen(false);
    setPostAdded(true);
  };

  const handlePostLike = async (postId: string) => {
    setlikeAdded(false);
    if (groupId && user) {
      await toggleLikePost(groupId, postId, user.uid);
      setlikeAdded(true);
    }
  };

  return (
    <div className="bg-white text-yellow-500 min-h-screen px-10 mb-10 pt-6 mt-12">
      <div className="w-full h-64 overflow-hidden">
        <img src={cover} alt="cover" className="w-full h-full object-cover" />
      </div>

      <div className="flex flex-col-reverse  lg:flex-row gap-10 mt-6">
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-6">{group.name}</h1>

          <p className="text-black mb-4">{group.description}</p>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Create a post..."
              onClick={() => setIsModalOpen(true)}
              className="w-full p-2 border  focus:outline-none   text-black border-yellow-500 rounded-lg "
              readOnly
            />
            {groupId && (
              <CreatePostModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
              >
                <CreatePost groupId={groupId} handlePost={handlePost} />
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
        {/*  Members Section */}
        <div className="w-full lg:w-1/4">
          <div className="md:p-4 p-1 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Members</h2>
            <ul>
              {group.members.map((member, index) => (
                <li key={index} className="text-black mb-2 flex items-center">
                  <img
                    src={member.profilePic || profile}
                    alt={`${member.name}'s profile`}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  {/* Member Name */}
                  <span>{member.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>{" "}
      </div>
    </div>
  );
};

export default GroupDetailsPage;
