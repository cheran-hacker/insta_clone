import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { FiSettings, FiGrid, FiBookmark, FiUser, FiX, FiTrash2, FiPlusSquare } from "react-icons/fi";
import '../App.css';

const Profile = () => {
    const [mypics, setPics] = useState([]);
    const [savedPics, setSavedPics] = useState([]);
    const [activeTab, setActiveTab] = useState('posts');

    const { state, dispatch } = useContext(UserContext);
    const [image, setImage] = useState("");
    const navigate = useNavigate();

    const [showModal, setShowModal] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [loading, setLoading] = useState(false);

    const defaultPic = "https://t4.ftcdn.net/jpg/00/64/67/27/360_F_64672736_U5kpdGs9keqll8CRQ3p3YaEv2M6qkVY5.jpg";

    const [selectedPost, setSelectedPost] = useState(null);

    useEffect(() => {
        fetch('http://localhost:5000/api/posts/mypost', {
            headers: { "Authorization": "Bearer " + localStorage.getItem("jwt") }
        })
            .then(res => res.json())
            .then(result => {
                setPics(result.mypost || []);
            });
    }, []);

    const fetchSaved = () => {
        fetch('http://localhost:5000/api/posts/mysavedposts', {
            headers: { "Authorization": "Bearer " + localStorage.getItem("jwt") }
        })
            .then(res => res.json())
            .then(result => {
                setSavedPics(result.saved || []);
            });
    };

    useEffect(() => {
        if (state) {
            setName(state.name || "");
            setBio(state.bio || "");
        }
    }, [state, showModal]);

    const handleLogout = () => {
        localStorage.clear();
        dispatch({ type: "CLEAR" });
        navigate('/login');
    };

    const deletePost = (postid) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        fetch(`http://localhost:5000/api/posts/deletepost/${postid}`, {
            method: "delete",
            headers: { "Authorization": "Bearer " + localStorage.getItem("jwt") }
        }).then(res => res.json())
            .then(result => {
                const newPics = mypics.filter(item => item._id !== result._id);
                setPics(newPics);
                setSelectedPost(null); // Close modal if deleted
            });
    };

    const updateProfile = () => {
        setLoading(true); // Triggers "Saving..." UI
        if (image) {
            const data = new FormData();
            data.append("file", image);
            data.append("upload_preset", "insta-clone");
            data.append("cloud_name", "dsfxb9qff");

            fetch("https://api.cloudinary.com/v1_1/dsfxb9qff/image/upload", { method: "post", body: data })
                .then(res => res.json())
                .then(data => {
                    if (data.error) { alert("Upload Failed"); setLoading(false); return; }
                    commitUpdate(data.url);
                })
                .catch(err => { console.log(err); setLoading(false); });
        } else {
            commitUpdate(state ? state.pic : defaultPic);
        }
    };

    const commitUpdate = (picUrl) => {
        fetch('http://localhost:5000/api/users/updateprofile', {
            method: "put",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer " + localStorage.getItem("jwt") },
            body: JSON.stringify({ name, bio, pic: picUrl })
        }).then(res => res.json())
            .then(result => {
                localStorage.setItem("user", JSON.stringify(result));
                dispatch({ type: "USER", payload: result });
                setShowModal(false); // Closes modal upon success
                setLoading(false); // Resets button state
            }).catch(err => {
                console.log(err);
                setLoading(false);
            });
    };

    // --- RENDER POST DETAIL MODAL ---
    const renderPostDetailModal = () => {
        if (!selectedPost) return null;
        return (
            <div className="modal-overlay" onClick={() => setSelectedPost(null)}>
                <div className="post-detail-content" onClick={e => e.stopPropagation()}>
                    <div className="post-detail-image-container">
                        <img src={selectedPost.photo} alt="post" className="post-detail-image" />
                    </div>
                    <div className="post-detail-sidebar">
                        <div className="post-detail-header">
                            <div className="post-header-user">
                                <img src={state?.pic} alt="" className="post-header-avatar" />
                                <span className="post-header-username">{state?.username}</span>
                            </div>
                            <FiTrash2 style={{ cursor: 'pointer' }} onClick={() => deletePost(selectedPost._id)} />
                        </div>
                        <div className="post-detail-comments">
                            <div className="post-caption-row">
                                <img src={state?.pic} alt="" className="comment-avatar" />
                                <div className="comment-text-wrapper">
                                    <span className="comment-username">{state?.username}</span>
                                    <span className="comment-text">{selectedPost.title} {selectedPost.body}</span>
                                </div>
                            </div>
                            {selectedPost.comments.map(record => (
                                <div key={record._id} className="post-comment-row">
                                    <span className="comment-username">{record.postedBy.username}</span>
                                    <span className="comment-text">{record.text}</span>
                                </div>
                            ))}
                        </div>
                        <div className="post-detail-actions">
                            <div className="post-action-icons">
                                <span style={{ fontSize: '24px', marginRight: '16px', cursor: 'pointer' }}>
                                    {selectedPost.likes.includes(state?._id) ? "❤️" : "🤍"}
                                </span>
                                <span style={{ fontSize: '24px', cursor: 'pointer' }}>💬</span>
                            </div>
                            <div className="post-likes-count">{selectedPost.likes.length} likes</div>
                            <div className="post-date">2 HOURS AGO</div>
                        </div>
                        <div className="post-detail-add-comment">
                            <input type="text" placeholder="Add a comment..." />
                            <button>Post</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-pic-wrapper">
                    <img className="profile-pic-lg" src={state?.pic || defaultPic} alt="profile" />
                </div>

                <div className="profile-info-section">
                    <div className="profile-title-row">
                        <h2 className="profile-username-header">{state ? state.username : "loading"}</h2>

                        <div className="profile-actions">
                            <button className="profile-edit-btn" onClick={() => setShowModal(true)}>Edit profile</button>
                            <button className="profile-edit-btn" onClick={() => navigate('/archive')}>View archive</button>
                            <FiSettings className="profile-settings-icon" onClick={() => setShowSettings(true)} />
                        </div>
                    </div>

                    <div className="profile-stats-row">
                        <span><span className="stat-count">{mypics.length > 0 ? mypics.length : "12"}</span> posts</span>
                        <span><span className="stat-count">{state ? (state.followers.length > 0 ? state.followers.length : "15.4K") : 0}</span> followers</span>
                        <span><span className="stat-count">{state ? (state.following.length > 0 ? state.following.length : "210") : 0}</span> following</span>
                    </div>

                    <div className="profile-bio-wrapper">
                        <span className="profile-realname">{state?.name}</span>
                        <div className="profile-bio-text">{state?.bio}</div>
                    </div>
                </div>
            </div>

            {/* HIGHLIGHTS STUB (Visual Only for now) */}
            <div className="profile-highlights">
                {[1, 2, 3].map(i => (
                    <div key={i} className="highlight-item">
                        <div className="highlight-circle">
                            <img src={`https://i.pravatar.cc/150?img=${i + 20}`} alt="highlight" />
                        </div>
                        <span>Highlight</span>
                    </div>
                ))}
                <div className="highlight-item">
                    <div className="highlight-circle new-highlight">
                        <FiPlusSquare size={20} />
                    </div>
                    <span>New</span>
                </div>
            </div>

            <div className="profile-tabs">
                <div className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>
                    <FiGrid /> POSTS
                </div>
                <div className={`profile-tab ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => { setActiveTab('saved'); fetchSaved(); }}>
                    <FiBookmark /> SAVED
                </div>
                <div className="profile-tab"><FiUser /> TAGGED</div>
            </div>

            <div className="gallery">
                {(activeTab === 'posts' ? (mypics.length > 0 ? mypics : [1, 2, 3, 4, 5, 6].map(i => ({ _id: i, photo: `https://picsum.photos/400?random=${i}`, likes: [], comments: [] }))) : savedPics).length === 0 ? (
                    <div className="profile-gallery-empty">
                        {activeTab === 'posts' ? "No Posts Yet" : "No Saved Posts"}
                    </div>
                ) : (
                    (activeTab === 'posts' ? (mypics.length > 0 ? mypics : [1, 2, 3, 4, 5, 6].map(i => ({ _id: i, photo: `https://picsum.photos/400?random=${i}`, likes: [], comments: [] }))) : savedPics).map(item => (
                        <div key={item._id} className="gallery-item" onClick={() => setSelectedPost(item)}>
                            <img className="gallery-img" src={item.photo} alt={item.caption} />
                            <div className="gallery-overlay">
                                <span>❤️ {item.likes.length}</span>
                                <span>💬 {item.comments.length}</span>
                            </div>
                        </div>
                    )))}
            </div>

            {selectedPost && renderPostDetailModal()}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="settings-modal-title">Edit Profile</h3>
                            <FiX onClick={() => setShowModal(false)} className="settings-close-btn" />
                        </div>
                        <div className="modal-body">
                            <div className="change-photo-section">
                                <img src={image ? URL.createObjectURL(image) : (state?.pic || defaultPic)} alt="preview" className="modal-avatar" />
                                <div>
                                    <h4 style={{ margin: 0, fontSize: "14px" }}>{state?.username}</h4>
                                    <label htmlFor="file-upload" className="change-photo-btn">Change Profile Photo</label>
                                    <input id="file-upload" type="file" onChange={(e) => setImage(e.target.files[0])} style={{ display: "none" }} />
                                </div>
                            </div>
                            <label className="input-label">Name</label>
                            <input type="text" className="modal-input" value={name} onChange={(e) => setName(e.target.value)} />
                            <label className="input-label">Bio</label>
                            <textarea className="modal-input" value={bio} onChange={(e) => setBio(e.target.value)} rows="3"></textarea>
                            <button className="btn-primary modal-submit-btn" onClick={updateProfile} disabled={loading}>
                                {loading ? "Saving..." : "Submit"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showSettings && (
                <div className="modal-overlay" onClick={() => setShowSettings(false)}>
                    <div className="modal-content settings-modal-content">
                        <div className="settings-list-item text-danger" onClick={handleLogout}>
                            Log Out
                        </div>
                        <div className="settings-list-item" onClick={() => setShowSettings(false)}>
                            Cancel
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Profile;