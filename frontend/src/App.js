import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "./pages/login/Login";
import Regiser from "./pages/register/Register";
import Home from "./pages/home/Home";
import Profile from "./pages/profile/Profile";
import UpdateUser from "./component/updateUser/UpdateUser";
import Comment from "./component/comment/Comment";
import UpdatePost from "./component/updatepost/UpdatePost";
import Messenger from "./pages/messenger/messenger";
import SearchUserPage from "./pages/searchUserPage/SearchUserPage";

// pages that need a logged-in user send everyone else to the login page
const RequireAuth = ({ user, children }) => (user ? children : <Navigate to="/login" replace />);

function App() {
  const { currentUser: user } = useSelector((state) => state.user);

  return (
    <Routes>
      <Route path="/" element={user ? <Home /> : <Regiser />} />
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Regiser />} />
      <Route path="/messenger" element={<RequireAuth user={user}><Messenger /></RequireAuth>} />
      <Route path="/profile/update" element={<RequireAuth user={user}><UpdateUser /></RequireAuth>} />
      <Route path="/profile/:userId" element={<Profile />} />
      <Route path="/searchuser" element={<RequireAuth user={user}><SearchUserPage /></RequireAuth>} />
      <Route path="/note/update/:notesid" element={<RequireAuth user={user}><UpdatePost /></RequireAuth>} />
      <Route path="/viewcomment/:notesid" element={<RequireAuth user={user}><Comment /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
