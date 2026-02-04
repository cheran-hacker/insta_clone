import React, { useEffect, useReducer, useContext } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Home from "./screens/Home";
import Login from "./screens/Login";
import Signup from "./screens/Signup";
import Profile from "./screens/Profile";
import UserProfile from "./screens/UserProfile";
import CreatePost from "./screens/CreatePost";
import Archive from "./screens/Archive";
import Messenger from "./screens/Messenger";
import Explore from "./screens/Explore";

import { reducer, initialState } from "./reducers/userReducer";
import { UserContext } from "./context/UserContext";

import "./App.css";

/* -------- ROUTES -------- */

const Routing = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/profile/:userid" element={<UserProfile />} />
    <Route path="/create" element={<CreatePost />} />
    <Route path="/archive" element={<Archive />} />
    <Route path="/chat" element={<Messenger />} />
    <Route path="/explore" element={<Explore />} />
  </Routes>
);

/* -------- APP -------- */

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <UserContext.Provider value={{ state, dispatch }}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </UserContext.Provider>
  );
}

/* -------- APP CONTENT -------- */

const AppContent = () => {
  const { dispatch } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("jwt");

    if (user && token) {
      dispatch({ type: "USER", payload: user });
    } else if (
      location.pathname !== "/login" &&
      location.pathname !== "/signup"
    ) {
      navigate("/login");
    }
  }, [dispatch, navigate, location.pathname]);

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/signup";

  return (
    <div className={!isAuthPage ? "app-layout" : ""}>
      {!isAuthPage && (
        <>
          <div className="desktop-sidebar-wrapper">
            <Sidebar />
          </div>
          <div className="mobile-navbar-wrapper">
            <Navbar />
          </div>
        </>
      )}

      <div className="app-content">
        <Routing />
      </div>
    </div>
  );
};

export default App;
