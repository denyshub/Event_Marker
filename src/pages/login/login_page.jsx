import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AuthPage.css";
import { API_IP } from "../../API_IP";
const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://${API_IP}/api/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("accessToken", data.access);
        localStorage.setItem("refreshToken", data.refresh);
        console.log("auth:", data.access, data.refresh);
        window.dispatchEvent(new Event("authChange")); // This will trigger the Header component to update immediately

        // Optionally, give a success feedback here (like a toast or alert)
        setTimeout(() => navigate("/"), 500); // Short delay to allow state change
      } else {
        setErrors({ general: "Invalid username or password" });
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErrors({ general: "An error occurred. Please try again later." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="body-auth">
      <div className="auth-container">
        <div className="auth-card">
          <h2>Welcome Back</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
              />
              {errors.username && (
                <span className="error">{errors.username}</span>
              )}
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
              />
              {errors.password && (
                <span className="error-auth">{errors.password}</span>
              )}
              <a href="/forgot-password" className="forgot-password">
                Forgot Password?
              </a>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account? <a href="/register">Register</a>
          </div>
          {errors.general && <p className="error-auth">{errors.general}</p>}
        </div>
    
      </div>
    </div>
  );
};

export default LoginPage;
