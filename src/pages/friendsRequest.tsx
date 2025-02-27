import React, { useEffect, useState } from "react";
import { auth } from "@/util/firebase/firebase";
import {
  getReceivedRequests,
  getSentRequests,
} from "@/util/firebase/services/friends";

const FriendRequestsPage = () => {
  const [received, setReceived] = useState<any[]>([]);
  const [sent, setSent] = useState<string[]>([]);
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (userId) {
      getReceivedRequests(userId).then(setReceived);
      getSentRequests(userId).then(setSent);
    }
  }, [userId]);

  return (
    <div className="requests-container">
      <div className="received-requests">
        <h3>Received Requests</h3>
        {/* {received.map(request => (
          // Render received requests with accept button
        ))} */}
      </div>

      <div className="sent-requests">
        <h3>Sent Requests</h3>
        {/* {sent.map(requestId => (
          // Render sent requests
        ))} */}
      </div>
    </div>
  );
};
