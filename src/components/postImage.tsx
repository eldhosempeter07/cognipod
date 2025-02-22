import { getImage } from "../util/functions";
import { FileProp } from "../util/types";
import React, { useEffect, useState } from "react";

interface PostImageProps {
  file: FileProp;
  from: string;
}

const PostImage: React.FC<PostImageProps> = ({ file, from }) => {
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getImage({
      imageUrl: file.path,
      setImageUrl,
      setLoading,
    });
  }, [file.path]);
  return (
    <div className="relative w-full flex justify-center items-center">
      {loading ? (
        <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg"></div>
      ) : imageUrl ? (
        <div className="w-full flex justify-center max-w-2xl  rounded-lg max-h-96">
          {" "}
          {/* Limit container height */}
          <img
            className={` h-64 ${
              from === "feed" ? "object-cover" : "object-contain"
            } cursor-pointer hover:opacity-90 transition-opacity duration-200`}
            src={imageUrl}
            alt={file.name}
          />
        </div>
      ) : null}
    </div>
  );
};

export default PostImage;
