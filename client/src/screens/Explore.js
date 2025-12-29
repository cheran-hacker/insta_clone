import React, { useState, useEffect } from 'react';
import '../App.css';

const Explore = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/posts/all', {
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("jwt")
      }
    })
      .then(res => res.json())
      .then(result => {
        // Show all posts in the explore tab
        if (result.posts) setPosts(result.posts);
      })
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="profile-container">
      <h4 className="explore-title">Explore</h4>

      <div className="gallery">
        {posts.map(item => (
          <div key={item._id} className="gallery-item">
            {item.mediaType === "video"
              ? <video className="gallery-img" src={item.photo} />
              : <img className="gallery-img" src={item.photo} alt="explore" />
            }

            <div className="gallery-overlay">
              <span>❤️ {item.likes.length}</span>
              <span>💬 {item.comments.length}</span>
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="explore-empty">
          <h3>No posts to explore yet.</h3>
        </div>
      )}
    </div>
  );
};

export default Explore;