import React, { useState, useEffect } from 'react';
import './Reels.css';

const Reels = () => {
  const [reels, setReels] = useState([]);

  useEffect(() => {
    fetch('/api/posts/reels', {
      headers: { "Authorization": "Bearer " + localStorage.getItem("jwt") }
    }).then(res => res.json()).then(result => setReels(result.posts));
  }, []);

  return (
    <div className="reels-container">
      {reels.map(item => (
        <div className="reel-card" key={item._id}>
          <video className="reel-video" src={item.photo} controls />
          <div className="reel-overlay">
            <div className="reel-username">
              <img src={item.postedBy.pic} alt="" className="reel-avatar-sm" />
              {item.postedBy.username}
            </div>
            <p className="reel-caption">{item.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
export default Reels;