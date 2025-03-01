import React, { useState, useEffect } from "react";
import { getPosts } from "../util/firebase/services/group";
import { Post } from "@/util/types";
import PostImage from "./postImage";
import profile from "../util/images/profile.png";
import { useNavigate } from "react-router-dom";

interface PostFeedProps {
  postLoading: boolean;
  posts: Post[];
  handlePostLike: (type: "user" | "group", postId: string) => void;
  groupId: string;
}

const PostFeed: React.FC<PostFeedProps> = ({
  postLoading,
  posts,
  handlePostLike,
  groupId,
}) => {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      {/* {postLoading && (
        <p className="text-yellow-500 text-center animate-pulse">
          Loading posts...
        </p>
      )} */}
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <li className="text-black mb-2 flex items-center">
            <img
              src={profile}
              alt="profile"
              className="w-10 h-10 rounded-full mr-3"
            />
            <span className="font-bold">{post.userName}</span>
          </li>
          <h3 className="text-xl font-semibold mb-2 text-gray-800">
            {post.title}
          </h3>
          <p className="text-gray-700 mb-4">{post.description}</p>

          {post.file && (
            <a href={`/${groupId}/post/${post.id}`} className="mb-4">
              <PostImage file={post.file} from="feed" />
            </a>
          )}

          <div className="flex space-x-4 text-gray-600">
            <button
              className="flex items-center space-x-2 hover:text-yellow-500 transition-colors duration-200"
              onClick={() =>
                post.type && post.id && handlePostLike(post.type, post.id)
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{post.likes?.length || null}</span>
            </button>
            <button
              className="flex items-center space-x-2 hover:text-yellow-500 transition-colors duration-200"
              onClick={() => navigate(`/${groupId}/post/${post.id}`)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                  clipRule="evenodd"
                />
              </svg>
              {/* <span>Comment</span> */}
            </button>
            <button className="flex items-center space-x-2 hover:text-yellow-500 transition-colors duration-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
              {/* <span>Share</span> */}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostFeed;
