import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./header.css";
import { ReactComponent as LogoIcon } from "../../images/svg/logo.svg";
import { checkAuth } from "../../authCheck";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(checkAuth());
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuthenticated(!!localStorage.getItem("accessToken"));
    };

    window.addEventListener("authChange", handleAuthChange);
    return () => window.removeEventListener("authChange", handleAuthChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsAuthenticated(false);
    navigate("/login");
    window.dispatchEvent(new Event("authChange"));
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          EventMarker <LogoIcon className="logo-icon" />
        </div>

        <button
          className="menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>

        <nav className={`nav-menu ${isMenuOpen ? "active" : ""}`}>
          <Link to="/" className="nav-link" onClick={handleLinkClick}>
            Home
          </Link>
          <Link to="/add_event" className="nav-link" onClick={handleLinkClick}>
            Add Event
          </Link>
          <Link to="/your-subscriptions" className="nav-link" onClick={handleLinkClick}>
            You Follow
          </Link>
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="nav-link" onClick={handleLinkClick}>
                Login
              </Link>
              <Link to="/register" className="nav-link register-link" onClick={handleLinkClick}>
                Register
              </Link>
            </>
          ) : (
            <Link className="nav-link" onClick={() => { handleLogout(); handleLinkClick(); }}>
              Logout
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
