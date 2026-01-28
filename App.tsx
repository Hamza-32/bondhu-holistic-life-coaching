import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { Coaching } from './pages/Coaching';
import { Community } from './pages/Community';
import { Arcade } from './pages/Arcade';
import { Toolkit } from './pages/Toolkit';
import { Journal } from './pages/Journal';
import { Resources } from './pages/Resources';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/coaching" element={<Coaching />} />
          <Route path="/community" element={<Community />} />
          <Route path="/arcade" element={<Arcade />} />
          <Route path="/toolkit" element={<Toolkit />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/resources" element={<Resources />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
