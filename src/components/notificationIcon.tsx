import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  DocumentData,
  QuerySnapshot,
} from "firebase/firestore";
import { db } from "../util/firebase/firebase";
import { useNavigate } from "react-router-dom";
import {
  fetchUserProfile,
  markNotificationsAsRead,
} from "../util/firebase/firebaseServices";

interface Notification {
  id: string;
  message: string;
  timestamp: any; // Firestore timestamp
  read: boolean;
  link: string;
}

interface NotificationIconProps {
  userId: string;
  notificationOpen: boolean;
  setNotificationOpen: (prev: boolean) => void;
  closeAllDropdowns: () => void;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({
  userId,
  notificationOpen,
  setNotificationOpen,
  closeAllDropdowns,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    college: "",
    phone: "",
    imageUrl: "",
    path: "",
    notification: 0,
  });
  useEffect(() => {
    if (userId) {
      setLoading(true);
      fetchUserProfile(userId)
        .then((data) => {
          setProfile({
            name: data.name || "",
            email: data.email || "",
            college: data.college || "",
            phone: data.phone || "",
            imageUrl: data.imageUrl || "",
            path: data.path || "",
            notification: data.notifications || 0,
          });
          setLoading(false);
        })
        .catch((err) => {
          setError("Failed to fetch profile data.");
          setLoading(false);
          console.error(err);
        });
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const notificationsRef = collection(db, "users", userId, "notifications");
    const q = query(notificationsRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const notifList: Notification[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Notification, "id">),
        }));

        setNotifications(notifList);
        setUnreadCount(notifList.filter((n) => !n.read).length);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const handleNotification = async () => {
    setNotificationOpen(!notificationOpen);
    closeAllDropdowns();

    await markNotificationsAsRead(userId);
  };

  return (
    <div className="relative">
      <button
        onClick={handleNotification}
        className="relative p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          className="w-6 h-6 text-gray-700"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.5-2M9 17H4l1.5-2m13.5-5a7 7 0 10-14 0v3.5a2 2 0 01-.5 1.34l-.5.66h16l-.5-.66a2 2 0 01-.5-1.34V10zM13.73 21a2 2 0 01-3.46 0"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {notificationOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
          <div className="p-2 text-gray-700 font-semibold border-b">
            Notifications
          </div>
          <div className="max-h-60 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.slice(0, 5).map((notif) => (
                <div
                  onClick={() => navigate(notif.link)}
                  key={notif.id}
                  className="p-3 hover:bg-gray-100 cursor-pointer transition"
                >
                  <p className="text-sm">{notif.message}</p>
                </div>
              ))
            ) : (
              <p className="p-3 text-sm text-gray-500">No new notifications</p>
            )}
          </div>
          {/* <button
            onClick={() => navigate("/notifications")}
            className="w-full text-center py-2 bg-gray-100 hover:bg-gray-200 transition text-gray-700 text-sm font-semibold"
          >
            See More
          </button> */}
        </div>
      )}
    </div>
  );
};

export default NotificationIcon;
