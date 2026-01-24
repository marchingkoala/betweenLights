import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchEyeglasses, fetchSunglasses } from '../redux/productsSlice';
import { Box, Typography } from '@mui/material';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const dispatch = useDispatch();
  const { eyeglasses, loading, error } = useSelector((state) => state.products);
  const [isTextVisible, setIsTextVisible] = useState(true);
  const [isTextFixed, setIsTextFixed] = useState(false);
  const heroSectionRef = useRef(null);

  useEffect(() => {
    dispatch(fetchEyeglasses());
    dispatch(fetchSunglasses());
  }, [dispatch]);

  useEffect(() => {
    const handleScroll = () => {
      if (heroSectionRef.current) {
        const rect = heroSectionRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // Hide text when hero section is completely scrolled out of view
        setIsTextVisible(rect.bottom > 0 && rect.top < viewportHeight);
        
        // If bottom of image is below viewport, use fixed positioning
        // Otherwise, use absolute positioning relative to image
        setIsTextFixed(rect.bottom > viewportHeight && rect.top < viewportHeight);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    handleScroll(); // Check initial position

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
<div className='landingPage'>
  <section className='landingFullMedia' ref={heroSectionRef}>
    <img src="/landingPage/main_landingHero.png" alt="Landing Hero" />
    <div className={`landingHeroText ${!isTextVisible ? 'hidden' : ''} ${isTextFixed ? 'fixed' : ''}`}>New York Collection</div>
  </section>
  <section className='landingSection'>
    <Link to="/sunglasses" className="landingSectionImage">
      <img src="/landingPage/main_landingSection2.png" alt="Sunglasses" />
      <div className="landingSectionText sunglassesText">Sunglasses</div>
    </Link>
    <Link to="/eyeglasses" className="landingSectionImage">
      <img src="/landingPage/main_landingSection.png" alt="Eyeglasses" />
      <div className="landingSectionText eyeglassesText">Eyeglasses</div>
    </Link>
  </section>
  <section className='landingNYCSection'>
    <p>Visit our NYC location in West Village</p>
  </section>
</div>
  );
};

export default LandingPage;

// 642px 925px