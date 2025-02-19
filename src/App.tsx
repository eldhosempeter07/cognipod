import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/home";
import AuthRouter from "./util/authRouter";
import { useContext } from "react";
import { AuthContext } from "./util/context/authContext";
import SignUpPage from "./pages/signup";
import CreateGroupPage from "./pages/createGroup";
import Groups from "./pages/groups";
import LoadingScreen from "./components/loadingScreen";

const App = () => {
  const { user, loading } = useContext(AuthContext) ?? {
    user: null,
    loading: true,
  };

  if (loading) {
    return (
      <>
        <LoadingScreen />
      </>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/search" element={<Home />} /> */}

        <Route
          path="/signup"
          element={user == null ? <SignUpPage /> : <Navigate to="/" />}
        />

        <Route
          path="/create-group/:id"
          element={<AuthRouter element={<CreateGroupPage />} />}
        />

        <Route path="/groups" element={<AuthRouter element={<Groups />} />} />
      </Routes>
    </>
  );
};

export default App;
