import { FC, useState } from "react";

interface CommentFormProp {
  handleComment: (comment: string) => void;
}

const CommentForm: FC<CommentFormProp> = ({ handleComment }) => {
  const [comment, setComment] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      handleComment(comment);
      setComment("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <input
        type="text"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a comment..."
        className="w-full p-2 border border-gray-300 rounded-lg"
      />
      <button
        type="submit"
        className="mt-2 bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
      >
        Comment
      </button>
    </form>
  );
};

export default CommentForm;
