import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';

const Signup = () => {
    const navigate = useNavigate();
    const [name, setName] = useState(""); // Full Name
    const [username, setUsername] = useState(""); // Handle
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const PostData = () => {
        const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!emailRegex.test(email)) {
            alert("Invalid email pattern");
            return;
        }

        setIsLoading(true);

        fetch("http://localhost:5000/api/auth/signup", {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                username,
                email: email.toLowerCase(),
                password
            })
        })
            .then(res => res.json())
            .then(data => {
                setIsLoading(false);
                if (data.error) {
                    alert(data.error);
                } else {
                    alert(data.message);
                    navigate('/login');
                }
            })
            .catch(err => {
                setIsLoading(false);
                console.log(err);
                alert("Server connection failed.");
            });
    };

    return (
        <div className="mycard">
            <div className="auth-card">
                <h2 className="brand-logo">Instagram</h2>
                <div className="auth-subtext">
                    Sign up to see photos and videos from your friends.
                </div>

                <button className="fb-login-btn" onClick={() => alert("Facebook Login coming soon")}>
                    <span style={{ fontWeight: 600 }}>Log in with Facebook</span>
                </button>

                <div className="auth-divider">
                    <div className="line"></div>
                    <div className="or-text">OR</div>
                    <div className="line"></div>
                </div>

                <div className="auth-input-container">
                    <input
                        className="input-field"
                        type="text"
                        placeholder="Mobile Number or Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        className="input-field"
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input
                        className="input-field"
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        className="input-field"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <div style={{ fontSize: '12px', color: '#8e8e8e', textAlign: 'center', margin: '15px 0' }}>
                        People who use our service may have uploaded your contact information to Instagram. <span style={{ fontWeight: 600 }}>Learn More</span>
                        <br /><br />
                        By signing up, you agree to our Terms, Privacy Policy and Cookies Policy.
                    </div>

                    <button className="btn-primary" onClick={PostData} disabled={isLoading}>
                        {isLoading ? "Signing Up..." : "Sign Up"}
                    </button>
                </div>
            </div>

            <div className="auth-secondary-card">
                <p className="auth-footer-text">Have an account? <Link to="/login" className="auth-link">Log in</Link></p>
            </div>

            <div className="get-app-section">
                <p>Get the app.</p>
                <div className="app-stores">
                    <img
                        src="https://static.cdninstagram.com/rsrc.php/v3/yt/r/Yfc020c87j0.png"
                        alt="App Store"
                        style={{ height: '40px', cursor: 'pointer' }}
                        onClick={() => alert("Redirecting to App Store...")}
                    />
                    <img
                        src="https://static.cdninstagram.com/rsrc.php/v3/yz/r/c5Rp7Ym-Klz.png"
                        alt="Google Play"
                        style={{ height: '40px', cursor: 'pointer' }}
                        onClick={() => alert("Redirecting to Google Play...")}
                    />
                </div>
            </div>
        </div>
    );
};
export default Signup;