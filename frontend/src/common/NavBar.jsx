import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../redux/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import '../styles/NavBar.css';
import CartPage from '../pages/CartPage';

const Navbar = ({ variant = 'auto' }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [hover, setHover] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cartItems = useSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartCountLabel = cartCount >= 10 ? '9+' : String(cartCount);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    setIsMenuOpen(false);
    dispatch(logout());
    navigate('/login');
  };

  const handleOpenCart = () => {
    setIsMenuOpen(false);
    setIsCartOpen(true);
  };

  const isNavbarWhite = variant === 'dark' ? true : hover || isScrolled;

  const cartButton = (
    <button type="button" className="nav_link nav_cartBtn" onClick={handleOpenCart}>
      Cart
      {cartCount > 0 && (
        <span className="nav_cartCount">({cartCountLabel})</span>
      )}
    </button>
  );

  return (
    <header
      className={`navbar ${isNavbarWhite ? 'navbar--light' : ''}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="nav_header">
        <Link to="/" className="nav_brand">
          Between Lights
        </Link>
      </div>

      <nav className="nav_primary nav_primary--desktop" aria-label="Main">
        <Link to="/customization" className="nav_link">3D Customization</Link>
        <Link to="/eyeglasses" className="nav_link">Eyeglasses</Link>
        <Link to="/sunglasses" className="nav_link">Sunglasses</Link>
        <Link to="/nyc-store" className="nav_link">NYC Store</Link>
      </nav>

      <div className="nav_secondary nav_secondary--desktop">
        <Link to="/search" className="nav_link">Search</Link>
        {!isAuthenticated && (
          <Link to="/login" className="nav_link">Login</Link>
        )}
        {isAuthenticated && (
          <Link to="/account" className="nav_link">Account</Link>
        )}
        {cartButton}
        {isAuthenticated && (
          <button type="button" onClick={handleLogout} className="nav_link logoutBtn">
            Logout
          </button>
        )}
      </div>

      <div className="nav_mobileActions">
        {cartButton}
        <button
          type="button"
          className={`nav_menuBtn ${isMenuOpen ? 'nav_menuBtn--open' : ''}`}
          aria-expanded={isMenuOpen}
          aria-controls="nav-mobile-menu"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span className="nav_menuIcon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      <div
        id="nav-mobile-menu"
        className={`nav_menuOverlay ${isMenuOpen ? 'nav_menuOverlay--open' : ''}`}
        aria-hidden={!isMenuOpen}
      >
        <div
          className="nav_menuBackdrop"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
        <nav className="nav_menuPanel" aria-label="Mobile">
          <Link to="/customization" className="nav_menuLink" onClick={() => setIsMenuOpen(false)}>
            3D Customization
          </Link>
          <Link to="/eyeglasses" className="nav_menuLink" onClick={() => setIsMenuOpen(false)}>
            Eyeglasses
          </Link>
          <Link to="/sunglasses" className="nav_menuLink" onClick={() => setIsMenuOpen(false)}>
            Sunglasses
          </Link>
          <Link to="/nyc-store" className="nav_menuLink" onClick={() => setIsMenuOpen(false)}>
            NYC Store
          </Link>
          <Link to="/search" className="nav_menuLink" onClick={() => setIsMenuOpen(false)}>
            Search
          </Link>
          {!isAuthenticated && (
            <Link to="/login" className="nav_menuLink" onClick={() => setIsMenuOpen(false)}>
              Login
            </Link>
          )}
          {isAuthenticated && (
            <Link to="/account" className="nav_menuLink" onClick={() => setIsMenuOpen(false)}>
              Account
            </Link>
          )}
          {isAuthenticated && (
            <button type="button" className="nav_menuLink" onClick={handleLogout}>
              Logout
            </button>
          )}
        </nav>
      </div>

      <CartPage
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </header>
  );
};

export default Navbar;
