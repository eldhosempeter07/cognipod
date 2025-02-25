import { useRef, useState } from "react";
import { addStudyGroup } from "../util/firebase/firebaseServices";
import { useNavigate, useParams } from "react-router-dom";
import { serverTimestamp } from "firebase/firestore";

export default function CreateGroupForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    groupType: "Public",
    members: [],
    groupAdmin: "",
    meetingSchedule: "",
    meetingLocation: "",
    goals: [],
    resources: [],
    discussionThreads: [],
    rules: [],
    progressTracking: "",
    groupSize: 0,
    tags: [],
    groupImage: "",
    joinRequests: [],
    activityFeed: [],
    groupStatus: "Active",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (id !== undefined) {
        const groupData = {
          ...formData,
          createdBy: id,
          createdAt: serverTimestamp(),
        };
        // Add the new study group to Firebase
        await addStudyGroup(groupData);

        // Redirect to the home page after successful creation
        navigate("/");
      }
    } catch (err) {
      if (err instanceof Error) {
        if (
          err.message === "A study group with the same name already exists."
        ) {
          setNameError(true);
          if (nameInputRef.current) {
            nameInputRef.current.focus();
            nameInputRef.current.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        } else {
          setError("Failed to create group. Please try again.");
          setNameError(false);
        }
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: string
  ) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, [field]: value.split(",") }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg"
    >
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Create a New Study Group
      </h1>

      {/* Group Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Group Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          ref={nameInputRef}
          value={formData.name}
          onChange={handleChange}
          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none  transition-all"
          required
        />

        {nameError ? (
          <h3 className="text-red-500 font-semibold mt-1 ml-1">
            Name Already Exist
          </h3>
        ) : null}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none  transition-all"
          required
        />
      </div>

      {/* Category/Topic */}
      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Category/Topic
        </label>
        <input
          type="text"
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none  transition-all"
          required
        />
      </div>

      {/* Group Type */}
      <div>
        <label
          htmlFor="groupType"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Group Type
        </label>
        <select
          id="groupType"
          name="groupType"
          value={formData.groupType}
          onChange={handleChange}
          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none  transition-all"
        >
          <option value="Public">Public</option>
          <option value="Private">Private</option>
        </select>
      </div>

      {/* Goals/Objectives */}
      <div>
        <label
          htmlFor="goals"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Goals/Objectives (comma-separated)
        </label>
        <input
          type="text"
          id="goals"
          name="goals"
          value={formData.goals.join(",")}
          onChange={(e) => handleArrayChange(e, "goals")}
          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none  transition-all"
        />
      </div>

      {/* Resources */}
      <div>
        <label
          htmlFor="resources"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Resources (comma-separated)
        </label>
        <input
          type="text"
          id="resources"
          name="resources"
          value={formData.resources.join(",")}
          onChange={(e) => handleArrayChange(e, "resources")}
          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none  transition-all"
        />
      </div>

      {/* Rules/Guidelines */}
      <div>
        <label
          htmlFor="rules"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Rules/Guidelines (comma-separated)
        </label>
        <input
          type="text"
          id="rules"
          name="rules"
          value={formData.rules.join(",")}
          onChange={(e) => handleArrayChange(e, "rules")}
          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none  transition-all"
        />
      </div>

      {/* Group Size */}
      <div>
        <label
          htmlFor="groupSize"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Group Size
        </label>
        <input
          type="number"
          id="groupSize"
          name="groupSize"
          value={formData.groupSize}
          onChange={handleChange}
          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none  transition-all"
        />
      </div>

      {/* Tags/Keywords */}
      <div>
        <label
          htmlFor="tags"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Tags/Keywords (comma-separated)
        </label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={formData.tags.join(",")}
          onChange={(e) => handleArrayChange(e, "tags")}
          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none  transition-all"
        />
      </div>

      {/* Group Image/Logo */}
      <div>
        <label
          htmlFor="groupImage"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Group Image/Logo URL
        </label>
        <input
          type="text"
          id="groupImage"
          name="groupImage"
          value={formData.groupImage}
          onChange={handleChange}
          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none  transition-all"
        />
      </div>

      {/* Group Status */}
      <div>
        <label
          htmlFor="groupStatus"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Group Status
        </label>
        <select
          id="groupStatus"
          name="groupStatus"
          value={formData.groupStatus}
          onChange={handleChange}
          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none  transition-all"
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Error Message */}
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-blue-300 disabled:cursor-not-allowed"
      >
        {loading ? "Creating..." : "Create Group"}
      </button>
    </form>
  );
}
