import React, { useContext, useState } from "react";
import { createPost } from "../util/firebase/services/group";
import { AuthContext } from "../util/context/authContext";
import { storage } from "../util/firebase/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Post } from "@/util/types";

interface CreatePostProps {
  groupId: string;
  handlePost: (post: Post) => void;
  type: string;
}

const CreatePost: React.FC<CreatePostProps> = ({
  groupId,
  handlePost,
  type,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useContext(AuthContext) ?? { user: null };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    setUploading(true);

    try {
      let fileDetails = null;
      let fileRef = null;
      let path = null;
      if (file) {
        // Upload the file and get its details
        if (type === "user") {
          fileRef = ref(storage, `user/${user.uid}/files/${file.name}`);

          path = `user/${user.uid}/files/${file.name}`;
        } else {
          path = `studyGroups/${groupId}/files/${file.name}`;

          fileRef = ref(storage, `studyGroups/${groupId}/files/${file.name}`);
        }

        await uploadBytes(fileRef, file);
        fileDetails = {
          name: file.name,
          url: await getDownloadURL(fileRef),
          path: path,
        };
      }

      const post = {
        title,
        description,
        file: fileDetails,
        uploadedBy: user.uid,
      };

      handlePost(post);

      // Reset the form
      setTitle("");
      setDescription("");
      setFile(null);
    } catch (error) {
      console.error("Error creating post: ", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-semibold mb-4">Create a Post</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full  focus:outline-none  p-2 border text-black border-yellow-500 rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full  focus:outline-none  p-2 border text-black border-yellow-500 rounded-lg"
            rows={3}
            required
          />
        </div>
        <div className="mb-4">
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full  focus:outline-none  p-2 border text-black border-yellow-500 rounded-lg"
          />
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
        >
          {uploading ? "Posting..." : "Post"}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
