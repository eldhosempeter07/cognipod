import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchGroupDetails, editGroup } from "../util/firebase/services/group";
import { StudyGroup } from "../util/types";
import { AuthContext } from "../util/context/authContext";
import LoadingScreen from "../components/loadingScreen";

const EditGroupPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext) ?? { user: null };
  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch group details
  useEffect(() => {
    const loadGroupDetails = async () => {
      if (groupId) {
        const groupData = await fetchGroupDetails(groupId);
        setGroup(groupData);
        setLoading(false);
      }
    };

    loadGroupDetails();
  }, [groupId]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group || !groupId || !user) return;

    try {
      await editGroup(groupId, group);
      navigate(`/group/${groupId}`); // Redirect to group details page
    } catch (err) {
      setError("Failed to update group. Please try again.");
      console.error(err);
    }
  };

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setGroup((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  // Handle array fields (e.g., rules, goals, tags, resources)
  const handleArrayChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof StudyGroup
  ) => {
    const { value } = e.target;
    setGroup((prev) => (prev ? { ...prev, [field]: value.split(",") } : null));
  };

  if (loading) {
    return (
      <>
        <LoadingScreen />
      </>
    );
  }

  if (!group) {
    return <div>Group not found.</div>;
  }

  // Check if the user is an admin
  if (!user || !group.groupAdmin.includes(user.uid)) {
    return <div>You do not have permission to edit this group.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Group</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Group Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Group Name</label>
          <input
            type="text"
            name="name"
            value={group.name}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={group.description}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <input
            type="text"
            name="category"
            value={group.category}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>

        {/* Rules */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Rules (comma-separated)
          </label>
          <input
            type="text"
            value={group.rules.join(",")}
            onChange={(e) => handleArrayChange(e, "rules")}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {/* Goals */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Goals (comma-separated)
          </label>
          <input
            type="text"
            value={group.goals.join(",")}
            onChange={(e) => handleArrayChange(e, "goals")}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {/* Group Type */}
        <div>
          <label className="block text-sm font-medium mb-2">Group Type</label>
          <select
            name="groupType"
            value={group.groupType}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
          >
            <option value="Public">Public</option>
            <option value="Private">Private</option>
          </select>
        </div>

        {/* Group Status */}
        <div>
          <label className="block text-sm font-medium mb-2">Group Status</label>
          <select
            name="groupStatus"
            value={group.groupStatus}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={group.tags.join(",")}
            onChange={(e) => handleArrayChange(e, "tags")}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {/* Resources */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Resources (comma-separated)
          </label>
          <input
            type="text"
            value={group.resources.join(",")}
            onChange={(e) => handleArrayChange(e, "resources")}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {/* Group Size */}
        <div>
          <label className="block text-sm font-medium mb-2">Group Size</label>
          <input
            type="number"
            name="groupSize"
            value={group.groupSize}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Save Changes
        </button>

        {/* Error Message */}
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  );
};

export default EditGroupPage;
