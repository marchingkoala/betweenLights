import React from "react";
import "../styles/NYCStorePage.css";

const NYCStorePage = () => {
  return (
    <div className="nycStorePage">
      <div className="locationContainer">
        <div className="locationTextSection">
          <div className="locationTextSection_line1">Between Lights</div>
          <div className="locationTextSection_line2">New York - Bowery</div>
          <div className="locationTextSection_details">
            Store Hours
            <br />
            Monday - Saturday: 11AM - 7PM
            <br />
            Sunday: 12PM - 6PM
            <br />
            <br />
            Contact
            <br />
            Phone: +1 (917) 777-7777
            <br />
            Email: hello@betweenlights.com
          </div>
        </div>
        <div className="locationMapSection">
          <img src="/eyestoremap.png" alt="Between Lights store location map" />
        </div>
      </div>
    </div>
  );
};

export default NYCStorePage;
