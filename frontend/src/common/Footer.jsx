import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className='footer'>
      <div className='footerLeft'>
        <p className='footerBrand'>Between Lights</p>
      </div>
      <div className='footerRight'>
        <div className='footerColumn'>
          <p className='footerEmail'>hello@betweenlights.com</p>
          <p className='footerPhone'>+1 (917) 777-7777</p>
        </div>
        <div className='footerColumn'>
          <p>Manhattan Showroom</p>
          <p>383 Mulberry St, Floor 3</p>
          <p>New York, NY 10012</p>
        </div>
        <div className='footerColumn'>
          <p>Brooklyn Production Studio</p>
          <p>123 12th Street, Suite 777</p>
          <p>Brooklyn, NY 11211</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;