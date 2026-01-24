import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './common/NavBar';
import Footer from './common/Footer';
import LandingPage from './pages/LandingPage';
import EyeglassesPage from './pages/EyeglassesPage';
import SunglassesPage from './pages/SunglassesPage';
import AboutPage from './pages/AboutPage';
import NYCStorePage from './pages/NYCStorePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import './App.css';

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/eyeglasses" element={<EyeglassesPage />} />
        <Route path="/sunglasses" element={<SunglassesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/nyc-store" element={<NYCStorePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/cart" element={<CartPage />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
