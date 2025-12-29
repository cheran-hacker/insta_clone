import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { useParams } from 'react-router-dom';
import { FiGrid, FiBookmark, FiUser } from "react-icons/fi";
import '../App.css';

const UserProfile = () => {
    const [userProfile, setProfile] = useState(null);
    const { state, dispatch } = useContext(UserContext);
    const { userid } = useParams();
    const [showFollow, setShowFollow] = useState(state ? !state.following.includes(userid) : true);

    useEffect(() => {
        fetch(`http://localhost:5000/api/users/${userid}`, {
            headers: { "Authorization": "Bearer " + localStorage.getItem("jwt") }
        }).then(res => res.json())
            .then(result => {
                setProfile(result);
            });
    }, [userid]); // Added userid as dependency

    const followUser = () => {
        fetch('http://localhost:5000/api/users/follow', {
            method: "put",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem('jwt')
            },
            body: JSON.stringify({ followId: userid })
        }).then(res => res.json())
            .then(data => {
                dispatch({ type: "UPDATE", payload: { following: data.following, followers: data.followers } });
                localStorage.setItem("user", JSON.stringify(data));
                setProfile((prevState) => {
                    return {
                        ...prevState,
                        user: {
                            ...prevState.user,
                            followers: [...prevState.user.followers, data._id]
                        }
                    }
                });
                setShowFollow(false);
            });
    };

    const unfollowUser = () => {
        fetch('http://localhost:5000/api/users/unfollow', {
            method: "put",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem('jwt')
            },
            body: JSON.stringify({ unfollowId: userid })
        }).then(res => res.json())
            .then(data => {
                dispatch({ type: "UPDATE", payload: { following: data.following, followers: data.followers } });
                localStorage.setItem("user", JSON.stringify(data));
                setProfile((prevState) => {
                    const newFollower = prevState.user.followers.filter(item => item !== data._id);
                    return {
                        ...prevState,
                        user: {
                            ...prevState.user,
                            followers: newFollower
                        }
                    }
                });
                setShowFollow(true);
            });
    };

    return (
        <>
            {userProfile ? (
                <div className="profile-container">
                    <div className="user-profile-header">
                        <div className="user-profile-pic-container">
                            <img
                                className="user-profile-pic"
                                src={userProfile.user.pic}
                                alt="profile"
                            />
                        </div>

                        <div className="user-profile-info">
                            <div className="user-profile-top">
                                <h2 className="user-profile-username">{userProfile.user.username}</h2>
                                {showFollow ? (
                                    <button className="btn-primary" onClick={() => followUser()}>
                                        Follow
                                    </button>
                                ) : (
                                    <button className="profile-edit-btn" onClick={() => unfollowUser()}>
                                        Following
                                    </button>
                                )}
                            </div>

                            <div className="user-profile-stats">
                                <span><strong>{userProfile.posts.length}</strong> posts</span>
                                <span><strong>{userProfile.user.followers.length}</strong> followers</span>
                                <span><strong>{userProfile.user.following.length}</strong> following</span>
                            </div>

                            <div className="user-profile-bio">
                                <h4>{userProfile.user.name}</h4>
                                <p>{userProfile.user.bio}</p>
                            </div>
                        </div>
                    </div>

                    <div className="profile-tabs">
                        <div className="profile-tab active"><FiGrid /> POSTS</div>
                        <div className="profile-tab"><FiBookmark /> SAVED</div>
                        <div className="profile-tab"><FiUser /> TAGGED</div>
                    </div>

                    <div className="gallery">
                        {userProfile.posts.map(item => (
                            <div key={item._id} className="gallery-item">
                                {item.mediaType === "video"
                                    ? <video className="gallery-img" src={item.photo} />
                                    : <img className="gallery-img" src={item.photo} alt={item.caption} />
                                }
                                <div className="gallery-overlay">
                                    <span>❤️ {item.likes.length}</span>
                                    <span>💬 {item.comments.length}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : <h2 style={{ textAlign: "center", marginTop: "50px" }}>Loading...</h2>}
        </>
    );
};
export default UserProfile;