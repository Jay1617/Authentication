import React from "react";
import "../styles/Instructor.css";
import profile from "../assets/profile.jpeg";

const Instructor = () => {
  return (
    <div className="instructor-page">
      <div className="instructor-card">
        <div className="instructor-image">
          <img src={profile} alt="Instructor" />
        </div>
        <div className="instructor-info">
          <h1>Jay Thummar</h1>
          <h4>Developer</h4>
          <p>
            Hello! I'm Jay Thummar, a passionate MERN stack developer
            with a love for teaching and building scalable, robust applications.
            With years of experience in JavaScript, React, Node.js, Express, and
            MongoDB, I am dedicated to helping developers learn and grow their
            skills. Join me in this journey to master authentication and the
            MERN stack!
          </p>
          <div className="social-links">
            <a
              href="https://github.com/jay1617"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/jay-thummar-256ba4250/"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
            <a
              href="https://x.com/JayThummar1617"
              target="_blank"
              rel="noopener noreferrer"
            >
              X
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Instructor;
