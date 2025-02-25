import React from "react";

interface ExitSessionPopupProps {
  onClose: () => void;
  onConfirm: () => void;
  heading: string;
  body: string;
  buttonText: string;
}

const ExitSessionPopup: React.FC<ExitSessionPopupProps> = ({
  onClose,
  onConfirm,
  body,
  heading,
  buttonText,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      {/* Popup Container */}
      <div className="bg-white w-11/12 max-w-md p-6 rounded-lg shadow-xl">
        {/* Popup Header */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">{heading}</h2>

        {/* Popup Body */}
        <p className="text-gray-600 mb-6">{body}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-200"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExitSessionPopup;
