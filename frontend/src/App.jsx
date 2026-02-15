import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import ProtectedRoute from './routes/protectedRoute'
import PublicOnlyRoute from './routes/publicOnlyRoute';
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
import AccountPage from './pages/AccountPage';
import ProductPage from "./pages/ProductPage";
import './App.css';

function App() {
  const location = useLocation();
  const darkPages = ['/'];
  const variant = !darkPages.includes(location.pathname) ? 'dark' : 'auto';

  return (
    <>
      <NavBar variant={variant} />
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/eyeglasses" element={<EyeglassesPage />} />
        <Route path="/sunglasses" element={<SunglassesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/nyc-store" element={<NYCStorePage />} />
        <Route path="/eyeglasses/product/:slug" element={<ProductPage />} />
        {/* Public-only routes */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/account" element={<AccountPage />} />
          <Route path="/cart" element={<CartPage />} />
        </Route>
      </Routes>
      <Footer />
    </>
  );
}

export default App;
