import React, { useContext, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
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
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useContext(AuthContext) ?? { user: null };

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
      description: Yup.string().required("Description is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      if (!user?.uid) return;

      setUploading(true);
      try {
        let fileDetails = null;
        let fileRef = null;
        let path = null;

        if (file) {
          path =
            type === "user"
              ? `user/${user.uid}/files/${file.name}`
              : `studyGroups/${groupId}/files/${file.name}`;

          fileRef = ref(storage, path);
          await uploadBytes(fileRef, file);
          fileDetails = {
            name: file.name,
            url: await getDownloadURL(fileRef),
            path,
          };
        }

        const post = {
          title: values.title,
          description: values.description,
          file: fileDetails,
          uploadedBy: user.uid,
        };

        handlePost(post);
        resetForm();
        setFile(null);
      } catch (error) {
        console.error("Error creating post: ", error);
      } finally {
        setUploading(false);
      }
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-semibold mb-4">Create a Post</h2>
      <form onSubmit={formik.handleSubmit}>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Title"
            {...formik.getFieldProps("title")}
            className="w-full focus:outline-none p-2 border text-black border-yellow-500 rounded-lg"
          />
          {formik.touched.title && formik.errors.title ? (
            <div className="text-red-500 text-sm">{formik.errors.title}</div>
          ) : null}
        </div>
        <div className="mb-4">
          <textarea
            placeholder="Description"
            {...formik.getFieldProps("description")}
            className="w-full focus:outline-none p-2 border text-black border-yellow-500 rounded-lg"
            rows={3}
          />
          {formik.touched.description && formik.errors.description ? (
            <div className="text-red-500 text-sm">
              {formik.errors.description}
            </div>
          ) : null}
        </div>
        <div className="mb-4">
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full focus:outline-none p-2 border text-black border-yellow-500 rounded-lg"
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
