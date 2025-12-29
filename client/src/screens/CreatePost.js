import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { FiImage, FiFilm, FiClock } from "react-icons/fi";

const CreatePost = () => {
  const navigate = useNavigate();
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState("");
  const [preview, setPreview] = useState("");
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState("post"); // 'post', 'reel', 'story'
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (url) {
      if (mode === "story") {
        fetch("http://localhost:5000/api/stories/create", {
          method: "post",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + localStorage.getItem("jwt") },
          body: JSON.stringify({ pic: url })
        }).then(res => res.json()).then(data => {
          navigate('/');
        });
      } else {
        // Post or Reel
        fetch("http://localhost:5000/api/posts/create", {
          method: "post",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + localStorage.getItem("jwt") },
          body: JSON.stringify({ caption, pic: url, mediaType: mode === 'reel' ? 'video' : 'image' })
        }).then(res => res.json()).then(data => {
          if (!data.error) navigate('/');
          else alert(data.error);
        });
      }
    }
  }, [url, navigate, caption, mode]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  }

  const postDetails = () => {
    setIsLoading(true);
    const data = new FormData();
    data.append("file", image);
    data.append("upload_preset", "insta-clone");
    data.append("cloud_name", "dsfxb9qff");

    let type = "image";
    if (mode === "reel" || (image.type && image.type.includes("video"))) {
      type = "video";
    }

    fetch(`https://api.cloudinary.com/v1_1/dsfxb9qff/${type}/upload`, {
      method: "post",
      body: data
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert("Upload failed: " + data.error.message);
          setIsLoading(false);
          return;
        }
        setUrl(data.url);
      })
      .catch(err => {
        console.log(err);
        setIsLoading(false);
      });
  };

  return (
    <div className="mycard" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="create-post-container">
        {/* HEADER with Share Button */}
        <div className="create-post-header">
          Create new post
          <button className="create-share-btn" onClick={postDetails} disabled={isLoading || !image}>
            {isLoading ? "Sharing..." : "Share"}
          </button>
        </div>

        <div className="create-body">
          {/* TABS */}
          <div className="create-tabs" style={{ width: '100%' }}>
            <div className={`create-tab ${mode === 'post' ? 'active' : ''}`} onClick={() => setMode('post')}>
              <FiImage /> Post
            </div>
            <div className={`create-tab ${mode === 'reel' ? 'active' : ''}`} onClick={() => setMode('reel')}>
              <FiFilm /> Reel
            </div>
            <div className={`create-tab ${mode === 'story' ? 'active' : ''}`} onClick={() => setMode('story')}>
              <FiClock /> Story
            </div>
          </div>

          {preview ? (
            <div className="create-post-preview">
              {image.type && image.type.includes("video")
                ? <video src={preview} controls style={{ width: "100%", height: "100%" }} />
                : <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              }
            </div>
          ) : (
            <div className="create-post-placeholder">
              <FiImage style={{ fontSize: "64px" }} />
              <p style={{ fontSize: "20px", fontWeight: "300" }}>Drag photos and videos here</p>

              <div className="upload-btn-wrapper">
                <button className="btn-upload">Select from computer</button>
                <input type="file" onChange={handleImageChange} accept={mode === 'reel' ? "video/*" : "image/*,video/*"} />
              </div>
            </div>
          )}

          {/* CAPTION (Only if media selected and not story) */}
          {preview && mode !== 'story' && (
            <textarea
              className="create-post-textarea"
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          )}

        </div>
      </div>
    </div>
  );
};
export default CreatePost;