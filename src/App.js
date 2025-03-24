import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


import Header from './components/header/header.jsx';
import Home from './pages/home/home.jsx';
import LoginPage from './pages/login/login_page.jsx';
import RegisterPage from './pages/register/register_page.jsx';
import EventDetail from './pages/event_detail/event_detail.jsx';
import EventMap from './pages/event_map/event_map.jsx';
import EventAddPage from './pages/add_event/add_event.jsx';
import SubscriptionsPage from './pages/my_sunscriptions/my_sunscriptions.jsx';
function App() {
  return (

    <Router>
      <Header />
      <div>
    
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events/:slug" element={<EventDetail />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/add_event" element={<EventAddPage />} />
     
          <Route path="/your-subscriptions" element={<SubscriptionsPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
