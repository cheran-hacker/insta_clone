import React, { useContext, useState, useEffect, useRef } from "react";
import { UserContext } from "../context/UserContext";
import { FiEdit } from "react-icons/fi"; // Icon for new chat
import "../App.css";

const Messenger = () => {
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showFollowersModal, setShowFollowersModal] = useState(false); // New Modal State
  const [followingUsers, setFollowingUsers] = useState([]); // List of users to chat with
  const { state } = useContext(UserContext);
  const scrollRef = useRef();

  // 1. Fetch Conversations
  useEffect(() => {
    if (state) {
      fetch("http://localhost:5000/api/chat/conversation/" + state._id)
        .then(res => res.json())
        .then(data => {
          if (data.length === 0) {
            setConversations([{
              _id: "dummy_conv",
              members: [state._id, "dummy_user"],
              isDummy: true
            }]);
          } else {
            setConversations(data);
          }
        });
    }
  }, [state]);

  // 2. Fetch Messages
  useEffect(() => {
    if (currentChat) {
      fetch("http://localhost:5000/api/chat/message/" + currentChat._id)
        .then(res => res.json())
        .then(data => {
          if (currentChat.isDummy) {
            setMessages([
              { sender: "dummy_user", text: "Welcome to Instagram Pro!", createdAt: Date.now() },
              { sender: state._id, text: "Thanks! Loving the new features.", createdAt: Date.now() }
            ]);
          } else {
            setMessages(data);
          }
        });
    }
  }, [currentChat]);

  // 3. Scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4. Send Message
  const handleSubmit = (e) => {
    e.preventDefault();
    const message = {
      sender: state._id,
      text: newMessage,
      conversationId: currentChat._id,
    };

    fetch("http://localhost:5000/api/chat/message", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message)
    })
      .then(res => res.json())
      .then(data => {
        setMessages([...messages, data]);
        setNewMessage("");
      });
  };

  // 5. Start Chat Function (Fixed Warning)
  const startChat = (receiverId) => {
    // Check if conversation already exists
    const existing = conversations.find(c => c.members.includes(receiverId));
    if (existing) {
      setCurrentChat(existing);
      setShowFollowersModal(false);
      return;
    }

    // Create new conversation
    fetch("http://localhost:5000/api/chat/conversation", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderId: state._id, receiverId })
    }).then(res => res.json())
      .then(data => {
        setConversations([...conversations, data]);
        setCurrentChat(data);
        setShowFollowersModal(false);
      });
  };

  // 6. Fetch "Following" users for the modal
  const openNewChatModal = () => {
    // We need to fetch details for everyone the user follows
    // Since we only have IDs in state.following, we ideally need an endpoint like /users/bulk
    // For now, we will just simulate it or if you have a "search" it's better.
    // Assuming you want to chat with people you follow:
    setShowFollowersModal(true);

    // Fetch details of following (This requires a backend update to be efficient, 
    // but here is a simple way using existing endpoints loop - not optimal but works for small lists)
    if (state.following.length > 0) {
      Promise.all(state.following.map(id =>
        fetch(`http://localhost:5000/api/users/${id}`, {
          headers: { "Authorization": "Bearer " + localStorage.getItem("jwt") }
        }).then(res => res.json())
      )).then(results => {
        setFollowingUsers(results.map(r => r.user));
      });
    }
  };

  return (
    <div className="messenger">
      {/* SIDEBAR */}
      <div className="chatMenu">
        <div className="chatMenuWrapper">
          <div className="chat-menu-header">
            <h4 className="chat-header-title">{state?.username}</h4>
            <FiEdit size={24} style={{ cursor: "pointer" }} onClick={openNewChatModal} title="New Message" />
          </div>

          {conversations.map((c, index) => (
            <div key={index} onClick={() => setCurrentChat(c)}>
              <Conversation conversation={c} currentUser={state} />
            </div>
          ))}

          {conversations.length === 0 && (
            <div style={{ padding: "20px", color: "#8e8e8e", textAlign: "center" }}>
              <p>No messages yet.</p>
              <button className="btn-primary" onClick={openNewChatModal}>Send Message</button>
            </div>
          )}
        </div>
      </div>

      {/* CHAT BOX */}
      <div className="chatBox">
        <div className="chatBoxWrapper">
          {currentChat ? (
            <>
              <div className="chatBoxTop">
                {messages.map((m, index) => (
                  <div key={index} ref={scrollRef}>
                    <div className={`message ${m.sender === state._id ? "own" : ""}`}>
                      <div className="messageText">{m.text}</div>
                      <div className="messageBottom">{new Date(m.createdAt).toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="chatBoxBottom">
                <input
                  className="chatMessageInput"
                  placeholder="Message..."
                  onChange={(e) => setNewMessage(e.target.value)}
                  value={newMessage}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                />
                <button className="chatSubmitButton" onClick={handleSubmit}>Send</button>
              </div>
            </>
          ) : (
            <div className="no-chat-selected">
              <span className="no-chat-icon">✈️</span>
              <span style={{ fontSize: "22px", color: "var(--text-primary)", fontWeight: "300" }}>Your Messages</span>
              <span style={{ color: "var(--text-secondary)" }}>Send private photos and messages to a friend.</span>
              <button className="btn-primary" style={{ width: "auto", marginTop: "20px" }} onClick={openNewChatModal}>Send Message</button>
            </div>
          )}
        </div>
      </div>

      {/* NEW CHAT MODAL */}
      {showFollowersModal && (
        <div className="modal-overlay" onClick={() => setShowFollowersModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ height: "400px" }}>
            <div className="modal-header">
              <h4 style={{ margin: 0 }}>New Message</h4>
              <button className="search-close-btn" style={{ background: "none", border: "none" }} onClick={() => setShowFollowersModal(false)}>X</button>
            </div>
            <div className="modal-body" style={{ overflowY: "auto" }}>
              <p style={{ fontWeight: "600", color: "#8e8e8e", marginBottom: "10px" }}>To:</p>
              {followingUsers.length === 0 ? <p>You are not following anyone yet.</p> :
                followingUsers.map(user => (
                  <div key={user._id} onClick={() => startChat(user._id)} style={{ display: "flex", alignItems: "center", padding: "10px", cursor: "pointer", borderBottom: "1px solid #efefef" }}>
                    <img src={user.pic} alt="" style={{ width: "40px", height: "40px", borderRadius: "50%", marginRight: "15px", objectFit: "cover" }} />
                    <div>
                      <div style={{ fontWeight: "600" }}>{user.username}</div>
                      <div style={{ fontSize: "12px", color: "#8e8e8e" }}>{user.name}</div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component
const Conversation = ({ conversation, currentUser }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (conversation.isDummy) {
      setUser({ username: "Instagram Team", pic: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/600px-Instagram_icon.png" });
      return;
    }
    const friendId = conversation.members.find((m) => m !== currentUser._id);
    fetch("http://localhost:5000/api/users/" + friendId, {
      headers: { "Authorization": "Bearer " + localStorage.getItem("jwt") }
    })
      .then(res => res.json())
      .then(data => setUser(data.user));
  }, [currentUser, conversation]);

  return (
    <div className="conversation">
      <img
        className="conversationImg"
        src={user?.pic || "https://t4.ftcdn.net/jpg/00/64/67/27/360_F_64672736_U5kpdGs9keqll8CRQ3p3YaEv2M6qkVY5.jpg"}
        alt=""
      />
      <span className="conversationName">{user?.username || "Loading..."}</span>
    </div>
  );
};

export default Messenger;