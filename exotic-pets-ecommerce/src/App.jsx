import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import awsConfig from './aws-config';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import ProductsPage from './pages/Products';
import CartPage from './pages/Cart';
import Checkout from './pages/Checkout';
import './index.css';
import ScrollToTop from './components/common/ScrollTop';
import ProductDetail from './pages/ProductDetail';

// Configure Amplify
Amplify.configure(awsConfig);


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark-900">
        {/* Scroll to top on route change */}
        <ScrollToTop />
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<ProductsPage />} />
          <Route path="/productos/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
