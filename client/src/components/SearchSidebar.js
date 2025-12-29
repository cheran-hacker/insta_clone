import React, { useState, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { Link } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import '../App.css';

const SearchSidebar = ({ isOpen, onClose }) => {
    const [search, setSearch] = useState('');
    const [userDetails, setUserDetails] = useState([]);
    const { state } = useContext(UserContext);

    const fetchUsers = (query) => {
        setSearch(query);
        fetch('http://localhost:5000/api/users/search-users', {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({ query })
        }).then(res => res.json())
            .then(results => {
                setUserDetails(results.user);
            }).catch(err => console.log(err));
    };

    return (
        <div className={`search-drawer ${isOpen ? 'open' : ''}`}>
            <div className="search-header">
                <h2>Search</h2>
                {/* Close button for mobile or explicit closing */}
                <button onClick={onClose} className="close-search-btn">
                    <FiX size={24} />
                </button>
            </div>

            <div className="search-input-container">
                <input
                    type="text"
                    placeholder="Search"
                    value={search}
                    onChange={(e) => fetchUsers(e.target.value)}
                    className="search-bar-input"
                />
            </div>

            <div className="search-results">
                {search && userDetails.length === 0 && (
                    <div className="no-results">No users found.</div>
                )}

                {!search && (
                    <div className="recent-search-placeholder">
                        <span className="recent-text">Recent</span>
                        <div className="empty-recent">No recent searches.</div>
                    </div>
                )}

                {userDetails.map(item => (
                    <Link
                        to={item._id !== state?._id ? "/profile/" + item._id : "/profile"}
                        key={item._id}
                        onClick={onClose}
                        className="search-user-item"
                    >
                        <img src={item.pic} alt="" className="search-user-avatar" />
                        <div className="search-user-info">
                            <span className="search-username">{item.username}</span>
                            <span className="search-fullname">{item.name}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default SearchSidebar;
