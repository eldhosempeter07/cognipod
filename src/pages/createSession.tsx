import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getAuth } from "firebase/auth";
import { addSession } from "../util/firebase/services/session"; // Import the Firebase service
import { SessionData, SessionGroupInputs } from "../util/types";
import { getUserGroups } from "../util/firebase/services/group";
import { auth } from "../util/firebase/firebase";
import { useNavigate } from "react-router-dom";
import { encryptData } from "../util/functions";

const CreateSession: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [goals, setGoals] = useState<string>("");
  const [type, setType] = useState<"text" | "in-person">("text");
  const [privacy, setPrivacy] = useState<"public" | "private">("public");
  const [selectedGroup, setSelectedGroup] = useState<string>("friends");
  const [meetingDate, setMeetingDate] = useState<Date>(new Date());
  const [meetingLink, setMeetingLink] = useState<string>("");
  const [groups, setGroups] = useState<SessionGroupInputs[]>([]);
  const [password, setPassword] = useState<string>("");
  const [showPreview, setShowPreview] = useState<boolean>(false); // State to control the preview popup
  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      getUserGroups(user.uid)
        .then((groups) => {
          console.log(groups);
          setGroups(groups);
        })
        .catch((error) => {
          console.error("Error fetching groups: ", error);
        });
    }
  }, [user]);

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPreview(true); // Show the preview popup
  };

  const handleCreateSession = async () => {
    if (!user) {
      alert("Please log in to create a session.");
      return;
    }

    const sessionData: SessionData = {
      name,
      description,
      goals,
      type,
      privacy,
      selectedGroup: privacy === "private" ? selectedGroup : null,
      createdBy: user.uid,
      createdDate: new Date(),
      meetingDate,
      password: privacy === "private" ? encryptData(password) : null,
      moderator: user.uid,
      status: "Created",
    };

    try {
      // Use the Firebase service to add the session
      await addSession(sessionData);
      navigate("/sessions");
    } catch (error) {
      console.error("Error creating session: ", error);
      alert("Failed to create session. Please try again.");
    }
  };

  const handleCancel = () => {
    setShowPreview(false); // Close the preview popup
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-20">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Create a New Study Session
      </h2>
      <form onSubmit={handlePreview} className="space-y-6">
        {/* Session Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Session Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Goals */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Goals
          </label>
          <textarea
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Meeting Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Meeting Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "text" | "in-person")}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="text">Text-based</option>
            <option value="in-person">In Person</option>
          </select>
        </div>

        {/* Privacy */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Privacy
          </label>
          <select
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value as "public" | "private")}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="public">Public (Anyone with link)</option>
            <option value="private">Private (Invite-only)</option>
          </select>
        </div>

        {/* Select Group (Conditional) */}
        {privacy === "private" && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Select Group
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="friends">Friends</option>
              {groups.length > 0
                ? groups.map((group) => (
                    <option value={group.name}>{group.name}</option>
                  ))
                : null}
            </select>
          </div>
        )}

        {privacy === "private" && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Meeting Date and Time
          </label>
          <DatePicker
            selected={meetingDate}
            onChange={(date: Date | null) => {
              if (date) {
                setMeetingDate(date);
              }
            }}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Preview Button */}
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Preview
        </button>
      </form>

      {/* Preview Popup */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-2xl w-full mx-2">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Session Preview
            </h2>
            <div className="space-y-3">
              {/* Session Name */}
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Session Name
                </span>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {name}
                </p>
              </div>

              {/* Description */}
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Description
                </span>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {description}
                </p>
              </div>

              {/* Goals */}
              <div>
                <span className="text-sm font-medium text-gray-500">Goals</span>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {goals}
                </p>
              </div>
              <div className="flex justify-between flex-wrap">
                {/* Meeting Type */}
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Meeting Type
                  </span>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {type}
                  </p>
                </div>

                {/* Privacy */}
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Privacy
                  </span>
                  <p className="text-lg font-semibold text-gray-900 mt-1 capitalize">
                    {privacy}
                  </p>
                </div>

                {/* Private Session Details */}
                {privacy === "private" && (
                  <>
                    {/* Selected Group */}
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Selected Group
                      </span>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {selectedGroup}
                      </p>
                    </div>

                    {/* Password */}
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Password
                      </span>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {password}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Meeting Date */}
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Meeting Date
                </span>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {new Date(meetingDate).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end space-x-4">
              {/* Cancel Button */}
              <button
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
              >
                Cancel
              </button>

              {/* Create Session Button */}
              <button
                onClick={handleCreateSession}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
              >
                Create Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Link (Conditional) */}
      {meetingLink && (
        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h3 className="text-lg font-semibold text-blue-800">Meeting Link</h3>
          <a
            href={meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block text-blue-600 hover:text-blue-800"
          >
            {meetingLink}
          </a>
        </div>
      )}
    </div>
  );
};

export default CreateSession;
