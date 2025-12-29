import React, { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import SearchSidebar from "./SearchSidebar";
import {
    FiHome,
    FiSearch,
    FiCompass,
    FiFilm,
    FiMessageCircle,
    FiHeart,
    FiPlusSquare,
    FiMenu,
    FiLogOut,
    FiInstagram,
    FiSettings,
    FiActivity,
    FiBookmark,
    FiMoon,
    FiSun,
    FiAlertCircle
} from "react-icons/fi";
import "../App.css";

const Sidebar = () => {
    const { state, dispatch } = useContext(UserContext);
    const location = useLocation();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [showSwitchModal, setShowSwitchModal] = useState(false); // Re-implementing modal here if it was removed from Home logic, or just for Sidebar control

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <SearchSidebar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

            <div className={`sidebar-container ${isSearchOpen ? 'narrow-sidebar' : ''}`}>
                <div className="sidebar-logo">
                    <Link to="/" style={{ display: isSearchOpen ? 'none' : 'flex', alignItems: 'center', gap: '10px', marginTop: '25px', marginBottom: '25px', paddingLeft: '12px', textDecoration: 'none' }}>
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/600px-Instagram_icon.png"
                            alt="Instagram Icon"
                            style={{ height: '30px', width: '30px' }}
                        />
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Instagram_logo.svg/800px-Instagram_logo.svg.png"
                            alt="Instagram"
                            style={{ height: '29px', marginTop: '5px' }}
                        />
                    </Link>
                    <div className="brand-icon-container" style={{ display: isSearchOpen ? 'flex' : 'none', justifyContent: 'center', marginTop: '25px', marginBottom: '25px' }}>
                        <FiInstagram size={24} className="sidebar-icon" />
                    </div>
                </div>

                <div className="sidebar-links">
                    <Link to="/" className={`sidebar-link ${isActive("/") ? "active" : ""}`}>
                        <FiHome className="sidebar-icon" /> <span className={isSearchOpen ? 'hide-text' : ''}>Home</span>
                    </Link>

                    <div className={`sidebar-link ${isSearchOpen ? "active" : ""}`} onClick={() => setIsSearchOpen(!isSearchOpen)}>
                        <FiSearch className="sidebar-icon" /> <span className={isSearchOpen ? 'hide-text' : ''}>Search</span>
                    </div>

                    <Link to="/explore" className={`sidebar-link ${isActive("/explore") ? "active" : ""}`}>
                        <FiCompass className="sidebar-icon" /> <span className={isSearchOpen ? 'hide-text' : ''}>Explore</span>
                    </Link>

                    <Link to="/reels" className={`sidebar-link ${isActive("/reels") ? "active" : ""}`}>
                        <FiFilm className="sidebar-icon" /> <span className={isSearchOpen ? 'hide-text' : ''}>Reels</span>
                    </Link>

                    <Link to="/messages" className={`sidebar-link ${isActive("/messages") ? "active" : ""}`}>
                        <FiMessageCircle className="sidebar-icon" /> <span className={isSearchOpen ? 'hide-text' : ''}>Messages</span>
                    </Link>

                    <div className="sidebar-link">
                        <FiHeart className="sidebar-icon" /> <span className={isSearchOpen ? 'hide-text' : ''}>Notifications</span>
                    </div>

                    <Link to="/create" className={`sidebar-link ${isActive("/create") ? "active" : ""}`}>
                        <FiPlusSquare className="sidebar-icon" /> <span className={isSearchOpen ? 'hide-text' : ''}>Create</span>
                    </Link>

                    <Link to="/profile" className={`sidebar-link ${isActive("/profile") ? "active" : ""}`}>
                        {state ? (
                            <img src={state.pic} alt="profile" className="sidebar-profile-pic" />
                        ) : (
                            <div className="sidebar-profile-placeholder" />
                        )}
                        <span className={isSearchOpen ? 'hide-text' : ''}>Profile</span>
                    </Link>
                </div>

                <div className="sidebar-footer">
                    <div className="sidebar-link" onClick={() => {
                        localStorage.clear();
                        dispatch({ type: "CLEAR" });
                        window.location.reload();
                    }}>
                        <FiLogOut className="sidebar-icon" /> <span className={isSearchOpen ? 'hide-text' : ''}>Log out</span>
                    </div>
                    <div className="sidebar-link" onClick={() => setShowMoreMenu(!showMoreMenu)}>
                        <FiMenu className="sidebar-icon" /> <span className={isSearchOpen ? 'hide-text' : ''}>More</span>
                    </div>
                </div>

                {/* MORE MENU POPUP */}
                {showMoreMenu && (
                    <div className="sidebar-more-menu" onMouseLeave={() => setShowMoreMenu(false)}>
                        <div className="more-menu-item" onClick={() => alert("Settings coming soon")}>
                            <FiSettings className="more-menu-icon" /> <span>Settings</span>
                        </div>
                        <div className="more-menu-item" onClick={() => alert("Activity coming soon")}>
                            <FiActivity className="more-menu-icon" /> <span>Your activity</span>
                        </div>
                        <div className="more-menu-item" onClick={() => alert("Saved coming soon")}>
                            <FiBookmark className="more-menu-icon" /> <span>Saved</span>
                        </div>
                        <div className="more-menu-item" onClick={() => {
                            document.body.classList.toggle('dark-mode');
                            localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
                        }}>
                            <FiMoon className="more-menu-icon" /> <span>Switch appearance</span>
                        </div>
                        <div className="more-menu-item" onClick={() => alert("Report logic here")}>
                            <FiAlertCircle className="more-menu-icon" /> <span>Report a problem</span>
                        </div>
                        <div className="more-menu-separator"></div>
                        <div className="more-menu-item" onClick={() => setShowSwitchModal(true)}>
                            <span>Switch accounts</span>
                        </div>
                        <div className="more-menu-item" onClick={() => {
                            localStorage.clear();
                            dispatch({ type: "CLEAR" });
                            window.location.reload();
                        }}>
                            <span>Log out</span>
                        </div>
                    </div>
                )}
            </div>
            {/* SWITCH ACCOUNTS MODAL (Sidebar) */}
            {showSwitchModal && (
                <div className="switch-modal-overlay">
                    <div className="switch-modal-container">
                        <div className="switch-modal-header">
                            <span>Switch accounts</span>
                            <button className="switch-modal-close" onClick={() => setShowSwitchModal(false)}>✕</button>
                        </div>
                        <div className="switch-modal-content">
                            {state && (
                                <div className="switch-user-row selected">
                                    <div className="switch-user-info">
                                        <img src={state.pic} alt="" className="switch-avatar" />
                                        <div className="switch-user-text">
                                            <span className="switch-username">{state.username}</span>
                                        </div>
                                    </div>
                                    <div className="switch-check">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Check_icon.svg/1200px-Check_icon.svg.png" alt="checked" width="20" />
                                    </div>
                                </div>
                            )}

                            <div className="switch-user-row" onClick={() => {
                                localStorage.clear();
                                dispatch({ type: "CLEAR" });
                                window.location.href = '/login';
                            }}>
                                <div className="switch-user-placeholder-avatar"></div>
                                <div className="switch-user-text">
                                    <span className="switch-username">Log into an Existing Account</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;
