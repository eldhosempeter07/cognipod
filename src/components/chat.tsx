import { sendMessage } from "../util/firebase/services/group";
import { Message } from "../util/types";
import React, { FC, useRef, useState } from "react";
import { User } from "firebase/auth";

interface ChatProps {
  messages: Message[];
  user: User;
  groupId: string;
}

const Chat: FC<ChatProps> = ({ groupId, messages, user }) => {
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [newMessage, setNewMessage] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);

    if (textAreaRef.current) {
      textAreaRef.current.style.height = "40px";
      textAreaRef.current.style.height = `${Math.min(
        textAreaRef.current.scrollHeight,
        150
      )}px`;
    }
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (newMessage.trim() && user?.uid && groupId) {
      await sendMessage(groupId, newMessage, user.uid);
      setNewMessage("");
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages: Message[]) => {
    const groupedMessages: { [key: string]: Message[] } = {};

    messages.forEach((message) => {
      if (message.createdAt) {
        const date = new Date(message.createdAt?.toDate());
        const dateKey = date.toDateString();

        if (!groupedMessages[dateKey]) {
          groupedMessages[dateKey] = [];
        }
        groupedMessages[dateKey].push(message);
      }
    });

    return groupedMessages;
  };

  // Format date label
  const formatDateLabel = (dateString: string) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const date = new Date(dateString);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  };

  // Group messages by date
  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div>
      {!isMessageOpen ? (
        <div
          className="fixed right-4 bottom-6 flex items-center gap-3 px-5 py-3 w-64 bg-white text-black 
         rounded-full shadow-lg hover:bg-gray-100 transition cursor-pointer border border-gray-300"
          onClick={() => setIsMessageOpen(true)}
        >
          {/* Chat Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            className="w-7 h-7 text-blue-600"
          >
            <path d="M12 2C6.48 2 2 6.02 2 11c0 2.52 1.03 4.8 2.71 6.48L3 22l4.71-1.72A10.01 10.01 0 0 0 12 20c5.52 0 10-4.02 10-9s-4.48-9-10-9zm3 9h-6c-.55 0-1-.45-1-1s.45-1 1-1h6c.55 0 1 .45 1 1s-.45 1-1 1zm-2 3H9c-.55 0-1-.45-1-1s.45-1 1-1h4c.55 0 1 .45 1 1s-.45 1-1 1z" />
          </svg>

          {/* Text Label */}
          <h3 className="text-lg font-semibold text-gray-800">Chat</h3>
        </div>
      ) : (
        <div className="fixed right-4 bottom-6 w-[22rem] bg-white rounded-lg shadow-lg p-4">
          <div className="flex justify-between items-center mb-3 border-b pb-2">
            <h2 className="text-xl font-semibold">Chat</h2>
            <button
              className="text-xl font-bold text-gray-600 hover:text-red-500 transition"
              onClick={() => setIsMessageOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="h-72 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-gray-100 scrollbar-hide">
            {Object.entries(groupedMessages).map(([dateKey, messages]) => (
              <div key={dateKey}>
                {/* Date Label */}
                <div className="text-center text-[0.8rem] font-semibold text-gray-600 my-3">
                  {formatDateLabel(dateKey)}
                </div>

                {/* Messages for this date */}
                {messages.map((message) => {
                  const isUserMessage =
                    user !== null && message.userId === user.uid;

                  return (
                    <div
                      key={message.id}
                      className={`mb-3 flex ${
                        isUserMessage ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[75%] px-3 py-2 rounded-lg shadow-sm ${
                          isUserMessage
                            ? "bg-yellow-500 text-black"
                            : "bg-gray-300 text-black"
                        }`}
                      >
                        {/* Sender Name */}
                        {!isUserMessage && (
                          <span className="text-sm font-semibold text-blue-500">
                            {message.userName}
                          </span>
                        )}

                        {/* Message Content */}
                        <p className="text-sm mt-1">{message.text}</p>

                        {/* Timestamp */}
                        <span className="text-xs text-gray-600 block text-right mt-1">
                          {message.createdAt &&
                            new Date(
                              message.createdAt?.toDate()
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="mt-4 flex items-end gap-2">
            <textarea
              ref={textAreaRef}
              value={newMessage}
              onChange={handleInputChange}
              className="w-full bg-white text-gray-900 p-3 rounded-lg border border-gray-300 shadow-sm 
             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
             resize-none overflow-hidden"
              placeholder="Type a message..."
              rows={1}
              style={{ minHeight: "40px", maxHeight: "120px" }}
            />
            <button
              onClick={handleSendMessage}
              className="bg-yellow-500 disabled:bg-yellow-200 text-white font-bold px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
              disabled={newMessage === ""}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
