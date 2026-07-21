import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AgentAssistant from '../components/AgentAssistant';

const StoreLayout = () => (
  <>
    <Header />
    <Outlet />
    <Footer />
    <AgentAssistant />
  </>
);

export default StoreLayout;
