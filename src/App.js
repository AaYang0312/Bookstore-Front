import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { CartProvider } from './contexts/CartContext';
import { UserProvider } from './contexts/UserContext';
import { CartAnimationProvider } from './contexts/CartAnimationContext';
import { FavoriteProvider } from './contexts/FavoriteContext';
import Hero from './components/Hero';
import CategoryButtons from './components/CategoryButtons';
import MainContent from './components/MainContent';
import RevealOnScroll from './components/RevealOnScroll';
import CartPage from './pages/CartPage';
import PaymentPage from './pages/PaymentPage';
import SearchPage from './pages/SearchPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import ProfilePage from './pages/ProfilePage';
import BookDetailPage from './pages/BookDetailPage';
import CategoryPage from './pages/CategoryPage';
import FavoritePage from './pages/FavoritePage';
import StoreLayout from './layouts/StoreLayout';
import AdminLayout from './admin/layout/AdminLayout';
import AdminGuard from './admin/components/AdminGuard';
import DashboardPage from './admin/pages/DashboardPage';
import BookManagePage from './admin/pages/BookManagePage';
import CategoryManagePage from './admin/pages/CategoryManagePage';
import OrderManagePage from './admin/pages/OrderManagePage';
import UserManagePage from './admin/pages/UserManagePage';
import CarouselManagePage from './admin/pages/CarouselManagePage';

function HomePage() {
  return (
    <>
      <Hero />
      <RevealOnScroll>
        <CategoryButtons />
      </RevealOnScroll>
      <RevealOnScroll delay={70}>
        <MainContent />
      </RevealOnScroll>
    </>
  );
}

function App() {
  return (
    <UserProvider>
    <CartProvider>
        <CartAnimationProvider>
          <FavoriteProvider>
            <Router>
              <div className="App">
                <Routes>
                  <Route element={<StoreLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/payment/:orderId" element={<PaymentPage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/orders" element={<OrderHistoryPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/book/:id" element={<BookDetailPage />} />
                  <Route path="/category/:category" element={<CategoryPage />} />
                  <Route path="/favorites" element={<FavoritePage />} />
                  </Route>
                  <Route element={<AdminGuard />}>
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<DashboardPage />} />
                      <Route path="books" element={<BookManagePage />} />
                      <Route path="categories" element={<CategoryManagePage />} />
                      <Route path="orders" element={<OrderManagePage />} />
                      <Route path="users" element={<UserManagePage />} />
                      <Route path="carousel" element={<CarouselManagePage />} />
                    </Route>
                  </Route>
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </Router>
          </FavoriteProvider>
        </CartAnimationProvider>
    </CartProvider>
    </UserProvider>
  );
}

export default App; 
