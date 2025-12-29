import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from "react-icons/fi";
import '../App.css';

const Archive = () => {
    const [archivedPosts, setArchivedPosts] = useState([]);
    const { state } = useContext(UserContext);
    const navigate = useNavigate();
    const [selectedPost, setSelectedPost] = useState(null);
    const [showOptionsModal, setShowOptionsModal] = useState(false);

    useEffect(() => {
        fetch('http://localhost:5000/api/posts/myarchive', {
            headers: { "Authorization": "Bearer " + localStorage.getItem("jwt") }
        })
            .then(res => res.json())
            .then(result => {
                setArchivedPosts(result.myarchive || []);
            });
    }, []);

    const unarchivePost = (postId) => {
        fetch('http://localhost:5000/api/posts/unarchive', {
            method: "put",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({ postId })
        }).then(res => res.json())
            .then(result => {
                const newArchive = archivedPosts.filter(item => item._id !== result._id);
                setArchivedPosts(newArchive);
                setShowOptionsModal(false);
            });
    };

    return (
        <div className="archive-container" style={{ maxWidth: '935px', margin: '0 auto', padding: '20px' }}>
            <div className="archive-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #dbdbdb', paddingBottom: '10px' }}>
                <FiArrowLeft size={24} style={{ cursor: 'pointer', marginRight: '16px' }} onClick={() => navigate('/profile')} />
                <div>
                    <div style={{ fontSize: '12px', color: '#8e8e8e' }}>{state?.username}</div>
                    <div style={{ fontWeight: '600', fontSize: '16px' }}>Posts Archive</div>
                </div>
            </div>

            <div className="gallery">
                {archivedPosts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', width: '100%' }}>
                        <h2>No Archived Posts</h2>
                        <p style={{ color: '#8e8e8e' }}>Only you can see your archived posts.</p>
                    </div>
                ) : (
                    archivedPosts.map(item => (
                        <div key={item._id} className="gallery-item" onClick={() => { setSelectedPost(item); setShowOptionsModal(true); }}>
                            <img className="gallery-img" src={item.photo} alt={item.title} />
                        </div>
                    ))
                )}
            </div>

            {/* OPTIONS MODAL FOR ARCHIVED POST */}
            {showOptionsModal && selectedPost && (
                <div className="modal-overlay" onClick={() => setShowOptionsModal(false)}>
                    <div className="options-modal-content">
                        <div className="options-item" onClick={() => unarchivePost(selectedPost._id)}>Show on Profile</div>
                        <div className="options-item text-danger" onClick={() => {
                            // Delete functionality could be added here similar to Profile
                            if (window.confirm("Delete this post?")) {
                                // reuse delete logic
                            }
                        }}>Delete</div>
                        <div className="options-item" onClick={() => setShowOptionsModal(false)}>Cancel</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Archive;
