import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import {
    FiHeart, FiMessageCircle, FiSend, FiBookmark,
    FiMoreHorizontal
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { io } from "socket.io-client";
import '../App.css';

const Home = () => {
    const [data, setData] = useState([]);
    const [stories, setStories] = useState([]);
    const [heartAnim, setHeartAnim] = useState({ show: false, id: null });
    const [showSwitchModal, setShowSwitchModal] = useState(false);

    const { state } = useContext(UserContext);
    const lastTap = useRef(0);
    const socket = useRef();

    useEffect(() => {
        // Connect to Socket.io
        socket.current = io("http://localhost:5000");

        // Listen for real-time updates
        socket.current.on("postUpdated", (updatedPost) => {
            setData(prevData => prevData.map(item =>
                item._id === updatedPost._id ? updatedPost : item
            ));
        });

        return () => {
            socket.current.disconnect();
        };
    }, []);

    useEffect(() => {
        fetch('http://localhost:5000/api/posts/all', {
            headers: { "Authorization": "Bearer " + localStorage.getItem("jwt") }
        }).then(res => res.json()).then(result => {
            if (result.posts) {
                setData(result.posts.reverse());

                // Generate Stories from Feed Users
                const uniqueUsers = [];
                const seenIds = new Set();
                result.posts.forEach(post => {
                    if (post.postedBy && !seenIds.has(post.postedBy._id) && post.postedBy._id !== state?._id) {
                        seenIds.add(post.postedBy._id);
                        uniqueUsers.push(post.postedBy);
                    }
                });
                const generatedStories = uniqueUsers.map(user => ({
                    id: user._id,
                    username: user.username,
                    pic: user.pic
                }));

                if (state) {
                    setStories([{ id: "me", username: "Your Story", pic: state.pic, isUser: true }, ...generatedStories]);
                }
            }
        });
    }, [state]);

    // --- LIKE ---
    const likePost = (id) => {
        // Optimistic Update
        const affectedPost = data.find(p => p._id === id);
        if (!affectedPost.likes.includes(state._id)) {
            const newLikes = [...affectedPost.likes, state._id];
            const newData = data.map(item => item._id === id ? { ...item, likes: newLikes } : item);
            setData(newData);
        }

        fetch('http://localhost:5000/api/posts/like', {
            method: "put",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer " + localStorage.getItem("jwt") },
            body: JSON.stringify({ postId: id })
        }).then(res => res.json()).then(result => {
            // Confirm with server data (optional, but good for consistency)
            // For now, if result is good, we are set. If we want precise server sync:
            const newData = data.map(item => (item._id === result._id ? result : item));
            setData(newData);
            socket.current.emit("likePost", result);
        }).catch(err => console.log(err));
    };

    // --- UNLIKE ---
    const unlikePost = (id) => {
        // Optimistic Update
        const affectedPost = data.find(p => p._id === id);
        if (affectedPost.likes.includes(state._id)) {
            const newLikes = affectedPost.likes.filter(uid => uid !== state._id);
            const newData = data.map(item => item._id === id ? { ...item, likes: newLikes } : item);
            setData(newData);
        }

        fetch('http://localhost:5000/api/posts/unlike', {
            method: "put",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer " + localStorage.getItem("jwt") },
            body: JSON.stringify({ postId: id })
        }).then(res => res.json()).then(result => {
            const newData = data.map(item => (item._id === result._id ? result : item));
            setData(newData);
            socket.current.emit("likePost", result);
        }).catch(err => console.log(err));
    };

    // --- COMMENT ---
    const makeComment = (text, postId) => {
        fetch('http://localhost:5000/api/posts/comment', {
            method: "put",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer " + localStorage.getItem("jwt") },
            body: JSON.stringify({ postId, text })
        }).then(res => res.json()).then(result => {
            const newData = data.map(item => (item._id === result._id ? result : item));
            setData(newData);
            socket.current.emit("commentPost", result); // Emit event
        }).catch(err => console.log(err));
    };

    // --- SHARE ---
    const sharePost = (postId) => {
        const link = window.location.origin + "/post/" + postId;
        navigator.clipboard.writeText(link);
        // Could use a toast library here, but for now specific alert is fine
        // Or implement a simple custom toast state
        alert("Link copied to clipboard!");
    };

    // --- DOUBLE TAP ---
    const handleDoubleTap = (postId) => {
        const now = Date.now();
        if (now - lastTap.current < 300) {
            setHeartAnim({ show: true, id: postId });

            // Only call API if not already liked
            const post = data.find(p => p._id === postId);
            if (post && !post.likes.includes(state?._id)) {
                likePost(postId);
            }
            setTimeout(() => setHeartAnim({ show: false, id: null }), 1000);
        }
        lastTap.current = now;
    };

    const [showOptionsModal, setShowOptionsModal] = useState(false);
    const [selectedPostIdOptions, setSelectedPostIdOptions] = useState(null);

    // --- OPTIONS MODAL HANDLER ---
    const handleOptionsClick = (postId) => {
        setSelectedPostIdOptions(postId);
        setShowOptionsModal(true);
    };

    // --- ARCHIVE POST ---
    const archivePost = (postId) => {
        fetch('http://localhost:5000/api/posts/archive', {
            method: "put",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({ postId })
        }).then(res => res.json())
            .then(result => {
                const newData = data.filter(item => item._id !== result._id);
                setData(newData);
                setShowOptionsModal(false);
            });
    };

    return (
        <div className="main-container">
            <div className="feed-container">

                {/* STORIES BAR */}
                <div className="stories-container">
                    {stories.map((story, index) => (
                        <div key={index} className="story-item">
                            <div className={story.isUser ? "story-ring story-ring-watched" : "story-ring"}>
                                <img src={story.pic} alt="" className="story-img" />
                            </div>
                            <span className="story-username">{story.username}</span>
                        </div>
                    ))}
                </div>

                {/* FEED POSTS */}
                {data.map(item => (
                    <div className="card" key={item._id}>
                        {/* Header */}
                        <div className="card-header">
                            <div className="user-details">
                                <Link to={item.postedBy._id !== state?._id ? "/profile/" + item.postedBy._id : "/profile"}>
                                    <img src={item.postedBy.pic} alt="" className="avatar-small" />
                                </Link>
                                <Link to={item.postedBy._id !== state?._id ? "/profile/" + item.postedBy._id : "/profile"}>
                                    <strong>{item.postedBy.username}</strong>
                                </Link>
                            </div>
                            <FiMoreHorizontal className="action-icon" onClick={() => handleOptionsClick(item._id)} />
                        </div>

                        {/* Image + Overlay Animation */}
                        <div className="card-image" onClick={() => handleDoubleTap(item._id)}>
                            <img src={item.photo} alt="post" />
                            {heartAnim.show && heartAnim.id === item._id && (
                                <div className="double-tap-heart">
                                    <FaHeart size={80} color="white" />
                                </div>
                            )}
                        </div>

                        {/* Interactions */}
                        <div className="card-content">
                            <div className="action-bar">
                                <div className="action-left">
                                    {/* Robust Like Check */}
                                    {item.likes.some(id => (typeof id === 'object' ? id._id : id) === state?._id) ? (
                                        <FaHeart
                                            size={24}
                                            className="action-icon liked-heart heart-pop"
                                            onClick={() => unlikePost(item._id)}
                                        />
                                    ) : (
                                        <FiHeart
                                            size={24}
                                            className="action-icon"
                                            onClick={() => likePost(item._id)}
                                        />
                                    )}
                                    <FiMessageCircle size={24} className="action-icon" />
                                    <FiSend size={24} className="action-icon" onClick={() => sharePost(item._id)} style={{ cursor: "pointer" }} />
                                </div>
                                <FiBookmark size={24} className="action-icon" />
                            </div>

                            <div className="likes-text">
                                <strong>{item.likes.length} likes</strong>
                            </div>

                            <div className="caption">
                                <strong>{item.postedBy.username}</strong> {item.body}
                            </div>

                            {/* Comment Preview */}
                            {item.comments.length > 0 && (
                                <div className="comments-section">
                                    {item.comments.length > 2 && <div className="view-all-comments">View all {item.comments.length} comments</div>}
                                    {item.comments.slice(-2).map(record => (
                                        <div key={record._id} className="comment-row">
                                            <strong>{record.postedBy.username}</strong> <span>{record.text}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="time-ago">2 HOURS AGO</div>

                            {/* Comment Input Form */}
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const commentText = e.target.querySelector('input').value;
                                makeComment(commentText, item._id);
                                e.target.querySelector('input').value = "";
                            }} className="comment-form-container">
                                <input type="text" placeholder="Add a comment..." className="comment-input-field" />
                                <button type="submit" className="post-comment-btn">Post</button>
                            </form>
                        </div>
                    </div>
                ))}
            </div>

            {/* RIGHT SIDEBAR (Suggestions) - Desktop Only */}
            <aside className="home-sidebar desktop-only">
                {state && (
                    <div className="sidebar-profile">
                        <Link to="/profile" className="sidebar-user-info">
                            <img src={state.pic} alt="" className="sidebar-avatar-lg" />
                            <div className="sidebar-text">
                                <span className="sidebar-username">{state.username}</span>
                                <span className="sidebar-subtext">{state.name}</span>
                            </div>
                        </Link>
                        <button className="switch-btn" onClick={() => setShowSwitchModal(true)}>Switch</button>
                    </div>
                )}

                <div className="suggestions-header">
                    <span>Suggested for you</span>
                    <button className="see-all-btn">See All</button>
                </div>

                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="sidebar-suggestion-card">
                        <div className="sidebar-user-info">
                            <img src={`https://i.pravatar.cc/150?img=${i + 10}`} alt="" className="sidebar-avatar-sm" />
                            <div className="sidebar-text">
                                <span className="sidebar-username">user_suggestion_{i}</span>
                                <span className="sidebar-subtext">New to Instagram</span>
                            </div>
                        </div>
                        <button className="switch-btn">Follow</button>
                    </div>
                ))}

                <div style={{ marginTop: "30px", fontSize: "12px", color: "#c7c7c7" }}>
                    © 2025 INSTAGRAM FROM META
                </div>
            </aside>

            {/* POST OPTIONS MODAL (3-Dots) */}
            {showOptionsModal && (
                <div className="modal-overlay" onClick={() => setShowOptionsModal(false)}>
                    <div className="options-modal-content">
                        <div className="options-item text-danger font-weight-bold">Report</div>
                        <div className="options-item text-danger font-weight-bold">Unfollow</div>
                        <div className="options-item" onClick={() => archivePost(selectedPostIdOptions)}>Archive</div>
                        <div className="options-item">Add to favorites</div>
                        <div className="options-item">Go to post</div>
                        <div className="options-item">Share to...</div>
                        <div className="options-item">Copy link</div>
                        <div className="options-item">Embed</div>
                        <div className="options-item">About this account</div>
                        <div className="options-item" onClick={() => setShowOptionsModal(false)}>Cancel</div>
                    </div>
                </div>
            )}

            {/* SWITCH ACCOUNTS MODAL */}
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

                            {/* Example other account (visual placeholder as requested) */}
                            <div className="switch-user-row" onClick={() => {
                                localStorage.clear();
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
        </div>
    );
};

export default Home;