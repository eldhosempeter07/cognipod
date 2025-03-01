import { decryptData } from "../util/functions";
import { SessionData } from "../util/types";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface SessionPasswordPopupProps {
  onClose: () => void;
  session: SessionData;
}

const SessionPasswordPopup: React.FC<SessionPasswordPopupProps> = ({
  onClose,
  session,
}) => {
  const navigate = useNavigate();
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const onConfirm = async () => {
    if (session.password) {
      const isValidPassword = await decryptData(session.password, password);
      if (isValidPassword) {
        setError("");
        return navigate(`/session/${session.id}`);
      }
      setError("Invalid Password");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-11/12 max-w-md p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Welcome To {session.name}
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Enter the password to continue
          </label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          {error ? (
            <span className="mt-3 text-red-500 font-semibold">{error}</span>
          ) : null}
        </div>

        <div className="flex justify-end space-x-4 mt-4">
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200"
          >
            Enter
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionPasswordPopup;
