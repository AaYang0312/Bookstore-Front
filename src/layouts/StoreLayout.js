import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AgentAssistant from '../components/AgentAssistant';
import './StoreLayout.css';

const StoreLayout = () => (
  <div className="store-layout">
    <div className="store-ambient" aria-hidden="true">
      <span className="store-ambient-glow store-ambient-glow-warm" />
      <span className="store-ambient-glow store-ambient-glow-green" />
    </div>
    <Header />
    <Outlet />
    <Footer />
    <AgentAssistant />
  </div>
);

export default StoreLayout;
