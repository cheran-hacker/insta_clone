import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import '../App.css';

const Login = () => {
    const { dispatch } = useContext(UserContext);
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const PostData = () => {
        setIsLoading(true);
        fetch("http://localhost:5000/api/auth/signin", {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: email.trim().toLowerCase(),
                password
            })
        })
            .then(res => res.json())
            .then(data => {
                setIsLoading(false);
                if (data.error) {
                    alert(data.error);
                } else {
                    localStorage.setItem("jwt", data.token);
                    localStorage.setItem("user", JSON.stringify(data.user));
                    dispatch({ type: "USER", payload: data.user });
                    navigate('/');
                }
            })
            .catch(err => {
                setIsLoading(false);
                alert("Connection error.");
            });
    };

    return (
        <div className="mycard">
            <div className="auth-card">
                <h2 className="brand-logo">Instagram</h2>
                <div className="auth-input-container">
                    <input className="input-field" type="text" placeholder="Phone number, username, or email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input className="input-field" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button className="btn-primary" onClick={PostData} disabled={isLoading}>
                        {isLoading ? "Logging in..." : "Log In"}
                    </button>
                </div>
                <div style={{ marginTop: "20px", fontSize: "12px", color: "#00376b", cursor: "pointer" }}>Forgot password?</div>
            </div>

            <div className="auth-card" style={{ padding: "20px", marginTop: "0" }}>
                <div style={{ fontSize: "14px" }}>
                    Don't have an account? <Link to="/signup" style={{ color: "#0095f6", fontWeight: "600" }}>Sign up</Link>
                </div>
            </div>
        </div>
    );
};
export default Login;