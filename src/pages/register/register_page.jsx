import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../login/AuthPage.css';
import { API_IP } from '../../API_IP';
const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_repeat: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.password_repeat) {
      newErrors.password_repeat = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      const requestBody = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_repeat: formData.password_repeat
      };

      try {
        const response = await fetch(`http://${API_IP}/register/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (response.ok) {
          setSuccessMessage('Registration Successful! Redirecting to login...');
          setTimeout(() => navigate('/login'), 2000); // Redirect after 2 seconds
        } else {
          setErrors(data.errors || { general: 'Something went wrong. Please try again.' });
        }
      } catch (error) {
        console.error('Error during registration:', error);
        setErrors({ general: 'An error occurred. Please try again later.' });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className='body-auth'>
      <div className="auth-container">
        <div className="auth-card">
          <h2>Create Account</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
              />
              {errors.username && <span className="error-auth">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
              {errors.email && <span className="error-auth">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
              />
              {errors.password && <span className="error-auth">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="password_repeat"
                value={formData.password_repeat}
                onChange={handleChange}
                placeholder="Repeat your password"
              />
              {errors.password_repeat && <span className="error-auth">{errors.password_repeat}</span>}
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
            {errors.general && <span className="error-auth">{errors.general}</span>}
          </form>

          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}

          <div className="auth-footer">
            Already have an account? <a href="/login">Login</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
