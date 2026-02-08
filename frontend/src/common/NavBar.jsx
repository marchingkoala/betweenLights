import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {logout} from '../redux/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import '../styles/NavBar.css';

const Navbar = ({ variant = 'auto' }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {user, isAuthenticated} = useSelector((state) => state.auth);
  const [hover, setHover] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial scroll position

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const styles = {
    navbar: {
      display: 'grid',
      gridTemplateColumns: 'repeat(8, 1fr)',
      alignItems: 'center',
      width: '100vw',
      boxSizing: 'border-box',
      padding: '15px 20px',
      maxHeight: '63px',
      minHeight: '59px',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1000,
      backgroundColor: 'transparent',
      borderBottom: '1px solid transparent',
      transition: 'background-color 0.3s ease',
    },
    navbarHover: {
      backgroundColor: 'white',
    },
    nav_header: {
         display: 'grid',
      gridColumn: '1 / 2',
      textDecoration: 'none',
      wordBreak: 'break-word',
      zIndex: 3,
      width: '100%',
      margin: 0,
      padding: 0,
       position: 'relative',
    },
    nav_primary: {
      gridColumn: '2 / 7',
      display: 'flex',
      justifyContent: 'center',
      gap: '50px',
    },
    nav_secondary: {
      gridColumn: '7 / 9',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '50px',
      alignItems: 'center',
      justifySelf: 'end',
      zIndex: 10,
       position: 'relative',
       padding: '0 0 0 2px'
    },
    link: {
      textDecoration: 'none',
      fontSize: '0.95rem',
      cursor: 'pointer',
      transition: 'color 0.3s ease',
    },
    brand: {
      fontWeight: 'bold',
      fontSize: '1.2rem',
      textDecoration: 'none',
      cursor: 'pointer',
      transition: 'color 0.3s ease',
    },
  };

 const isNavbarWhite = variant === 'dark' ? true : hover || isScrolled;

  return (
    <div
      style={{ ...styles.navbar, ...(isNavbarWhite ? styles.navbarHover : {}) }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Store Name */}
      <div className="nav_header" style={styles.nav_header}>
        <Link to="/" style={{ ...styles.brand, color: isNavbarWhite ? 'black' : 'white' }}>
          Between Lights
        </Link>
      </div>

      {/* Center Links */}
      <div className="nav_primary" style={styles.nav_primary}>
        <Link to="/about" style={{ ...styles.link, color: isNavbarWhite ? 'black' : 'white' }}>
          About Us
        </Link>
        <Link to="/eyeglasses" style={{ ...styles.link, color: isNavbarWhite ? 'black' : 'white' }}>
          Eyeglasses
        </Link>
        <Link to="/sunglasses" style={{ ...styles.link, color: isNavbarWhite ? 'black' : 'white' }}>
          Sunglasses
        </Link>
        <Link to="/nyc-store" style={{ ...styles.link, color: isNavbarWhite ? 'black' : 'white' }}>
          NYC Store
        </Link>
      </div>

      {/* Right Links */}
      <div className="nav_secondary" style={styles.nav_secondary}>
        <Link to="/search" style={{ ...styles.link, color: isNavbarWhite ? 'black' : 'white' }}>
          Search
        </Link>
        {!isAuthenticated && (<Link to="/login" style={{ ...styles.link, color: isNavbarWhite ? 'black' : 'white' }}>Login</Link>)}
        {isAuthenticated && (<Link to="/account" style={{ ...styles.link, color: isNavbarWhite ? 'black' : 'white' }}>
        Account</Link>)}
        <Link to="/cart" style={{ ...styles.link, color: isNavbarWhite ? 'black' : 'white' }}>
          Cart
        </Link>
        {isAuthenticated && <button onClick={handleLogout} className="logoutBtn" style={{
      ...styles.link,
      background: 'none',
      border: 'none',
      padding: 0,
      color: isNavbarWhite ? 'black' : 'white',
    }}>
        Logout
      </button>}
      </div>
    </div>
  );
};

export default Navbar;
