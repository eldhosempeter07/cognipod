import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Home from "./pages/home";
import AuthRouter from "./util/authRouter";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./util/context/authContext";
import SignUpPage from "./pages/signup";
import CreateGroupPage from "./pages/createGroup";
import Groups from "./pages/groups";
import LoadingScreen from "./components/loadingScreen";
import GroupDetailsPage from "./pages/groupDetails";
import PostDetail from "./pages/postDetails";
import Header from "./components/header";
import CreateSession from "./pages/createSession";
import SessionsPage from "./pages/sessions";
import Profile from "./pages/profile";
import SessionDetails from "./pages/sessionDetails";
import EditGroupPage from "./pages/editGroup";
import JoinRequestsPage from "./pages/joinRequest";
import MembersPage from "./pages/members";
import UserFeed from "./pages/feed";

const App = () => {
  const { user, loading } = useContext(AuthContext) ?? {
    user: null,
    loading: true,
  };

  const navigate = useNavigate();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    if (!loading) {
      setIsAuthChecked(true);
    }
  }, [loading]);

  if (!isAuthChecked) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={user ? <Navigate to="/feed" /> : <Home />} />

        <Route
          path="/signup"
          element={user == null ? <SignUpPage /> : <Navigate to="/" />}
        />

        <Route
          path="/create-group/:id"
          element={<AuthRouter element={<CreateGroupPage />} />}
        />

        <Route
          path="/profile/:id"
          element={<AuthRouter element={<Profile />} />}
        />
        <Route
          path="/create-session/:id"
          element={<AuthRouter element={<CreateSession />} />}
        />

        <Route path="/groups" element={<AuthRouter element={<Groups />} />} />
        <Route
          path="/group/:groupId"
          element={<AuthRouter element={<GroupDetailsPage />} />}
        />

        <Route
          path=":type/:groupId/post/:postId"
          element={<AuthRouter element={<PostDetail />} />}
        />

        <Route
          path="/sessions"
          element={<AuthRouter element={<SessionsPage />} />}
        />

        <Route
          path="/session/:sessionId"
          element={<AuthRouter element={<SessionDetails />} />}
        />

        <Route
          path="group/:groupId/edit"
          element={<AuthRouter element={<EditGroupPage />} />}
        />

        <Route
          path="/group/:groupId/join-requests"
          element={<AuthRouter element={<JoinRequestsPage />} />}
        />
        <Route
          path="/group/:groupId/members"
          element={<AuthRouter element={<MembersPage />} />}
        />
        <Route path="/feed" element={<AuthRouter element={<UserFeed />} />} />
      </Routes>
    </>
  );
};

export default App;
