import React from "react";
import "../styles/Footer.css";
import { Link } from "react-router-dom";
import x from "../assets/x.png";
import git from "../assets/git.png";
import linkedin from "../assets/linkedin.png";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">
          <h2>MERN Authentication</h2>
          <p>Your ultimate guide to mastering the MERN stack.</p>
        </div>
        <div className="footer-social">
          <h3>Follow Me</h3>
          <div className="social-icons">
            <Link
              to="https://www.linkedin.com/in/jay-thummar-256ba4250/"
              target="_blank"
              className="social-link"
            >
              <img src={linkedin} alt="LinkedIn" />
            </Link>
            <Link
              to="https://github.com/jay1617"
              target="_blank"
              className="social-link"
            >
              <img src={git} alt="GitHub" />
            </Link>
            <Link
              to="https://x.com/JayThummar1617"
              target="_blank"
              className="social-link"
            >
              <img src={x} alt="X" />
            </Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 MERN Authentication. All Rights Reserved.</p>
        <p>Designed by Jay1617  </p>
      </div>
    </footer>
  );
};

export default Footer;