import { useContext, useEffect, useState } from "react";
import {
  fetchPost,
  fetchComments,
  addCommentToPost,
  toggleLikePost,
} from "../util/firebase/services/group";
import { AuthContext } from "../util/context/authContext";
import { useParams } from "react-router-dom";
import { Comment, Post } from "@/util/types";
import PostImage from "../components/postImage";
import LikeButton from "../components/likeButton";
import CommentForm from "../components/commentForm";
import profile from "../util/images/profile.jpg";
import { Timestamp } from "firebase/firestore";
const PostDetail = () => {
  const { user } = useContext(AuthContext) ?? {
    user: null,
    loading: true,
  };

  const { type, groupId, postId } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[] | []>([]);
  const [loading, setLoading] = useState(true);
  const [commentloading, setCommentLoading] = useState(true);
  const [likeAdded, setlikeAdded] = useState(false);
  const [commentAdded, setCommentAdded] = useState(false);

  const loadPost = async () => {
    if (!groupId || !postId || !type) return;
    const postData = await fetchPost(type, groupId, postId);
    setPost(postData);
    setLoading(false);
  };

  // Fetch post details
  useEffect(() => {
    loadPost();
  }, [groupId, postId]);

  const getComments = async () => {
    if (!groupId || !postId || !type) return;

    setCommentLoading(true);
    const commentData = await fetchComments(type, groupId, postId);
    setComments(commentData);
    setCommentLoading(false);
  };

  useEffect(() => {
    getComments();
  }, [groupId, postId]);

  useEffect(() => {
    if (likeAdded) {
      loadPost();
    }
  }, [likeAdded]);

  useEffect(() => {
    if (commentAdded) {
      getComments();
    }
  }, [commentAdded]);

  //   if (loading) {
  //     return <p>Loading post...</p>;
  //   }

  if (!post) {
    return <p>Post not found.</p>;
  }

  const handleComment = async (comment: string) => {
    setCommentAdded(false);
    if (groupId && postId && type)
      if (user?.uid) {
        await addCommentToPost(type, groupId, postId, user.uid, comment);
        setCommentAdded(true);
      }
  };

  const handlePostLike = async () => {
    setlikeAdded(false);
    if (groupId && user && type && postId)
      await toggleLikePost(type, groupId, postId, user.uid);
    setlikeAdded(true);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto mt-16">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <li className="text-black mb-2 flex items-center">
          <img
            src={post.imageUrl || profile}
            alt="profile"
            className="w-10 h-10 rounded-full mr-3"
          />
          <span className="font-bold">{post.userName}</span>
        </li>
        <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
        <p className="text-gray-700 mb-4">{post.description}</p>
        {post.file && (
          <div className="mb-4">
            <PostImage file={post.file} from="post" />
          </div>
        )}
        <div className="flex items-center space-x-4">
          <LikeButton handlePostLike={handlePostLike} />
          <span>{post.likes?.length || 0} Likes</span>
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Comments</h2>
        <CommentForm handleComment={handleComment} />
        <div className="mt-4 space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
              <li className="text-black mb-2 flex">
                <img
                  src={comment.imageUrl || profile}
                  alt="profile"
                  className="w-10 h-10 rounded-full mr-3 mt-1"
                />
                <div>
                  <span className="text-sm font-semibold">{post.userName}</span>
                  <p className="text-gray-700 text-sm">{comment.text}</p>
                </div>
              </li>
              <p className="text-sm text-gray-500">
                <span className="text-xs text-gray-600 block text-right mt-1">
                  {comment.createdAt instanceof Timestamp
                    ? new Date(comment.createdAt?.toDate()).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )
                    : null}
                </span>{" "}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
