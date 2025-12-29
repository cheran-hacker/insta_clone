import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { FiHome, FiMessageSquare, FiPlusSquare, FiCompass, FiLogOut, FiSearch, FiHeart } from "react-icons/fi";
import SearchSidebar from './SearchSidebar'; // Import the new sidebar
import '../App.css';

const Navbar = () => {
    const { state, dispatch } = useContext(UserContext);
    const navigate = useNavigate();
    const [isSearchOpen, setIsSearchOpen] = useState(false); // Sidebar state

    const logout = () => {
        localStorage.clear();
        dispatch({ type: "CLEAR" });
        navigate('/login');
    }

    // --- THEME TOGGLE ---
    const toggleTheme = () => {
        if (document.body.classList.contains("dark-mode")) {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("theme", "light");
        } else {
            document.body.classList.add("dark-mode");
            localStorage.setItem("theme", "dark");
        }
    };

    return (
        <>
            <nav>
                <div className="nav-wrapper">
                    <Link to={state ? "/" : "/login"} className="brand-logo">Instagram</Link>

                    {state ? (
                        <div className="nav-menu desktop-only">
                            <Link to="/"><FiHome className="nav-icon" /></Link>
                            <Link to="/chat"><FiMessageSquare className="nav-icon" /></Link>
                            <Link to="/create"><FiPlusSquare className="nav-icon" /></Link>
                            <Link to="/explore"><FiCompass className="nav-icon" /></Link>

                            {/* SEARCH TRIGGER - Toggles Sidebar */}
                            <FiSearch className="nav-icon" onClick={() => setIsSearchOpen(true)} style={{ cursor: 'pointer' }} />

                            {/* THEME TOGGLE */}
                            <FiCompass className="nav-icon" style={{ transform: "rotate(45deg)" }} onClick={toggleTheme} title="Toggle Theme" />

                            <div className="dropdown">
                                <Link to="/profile">
                                    <img
                                        src={state.pic}
                                        alt="profile"
                                        className="nav-profile-img"
                                    />
                                </Link>
                            </div>
                            <FiLogOut className="nav-icon" onClick={logout} style={{ marginLeft: "15px", color: "#ed4956" }} />
                        </div>
                    ) : (
                        <div className="nav-menu">
                            <Link to="/login" style={{ color: "#0095f6", fontWeight: "600", fontSize: "14px" }}>Log In</Link>
                            <Link to="/signup" style={{ color: "#0095f6", fontWeight: "600", fontSize: "14px" }}>Sign Up</Link>
                        </div>
                    )}
                </div>
            </nav>

            {/* --- PREMIUM SEARCH DRAWER --- */}
            <SearchSidebar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
};
export default Navbar;