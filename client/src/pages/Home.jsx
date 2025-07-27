import React from 'react';
import './Home.css'; // Make sure to import the CSS file

const Home = () => {
  return (
    <div className="main-container " style={{minHeight: "100vh"}}>
      <div className="left-container">
        <h1 className="animated-text">Welcome to the HSBC Banking Assistant</h1>
        <p className="description">Your trusted partner in digital banking. Ask questions, manage your accounts, and get help 24/7.</p>
      </div>
      <div className="right-container">
        {/* The 3D model is replaced with the HSBC logo image */}
        <img 
          src="data:image/png;base64,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" 
          alt="HSBC Logo" 
          className="logo-image"
        />
      </div>
    </div>
  );
};

export default Home;