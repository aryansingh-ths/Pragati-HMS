import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Core Layout & Section Components
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import Dining from './components/Dining';
import Gallery from './components/Gallery';
import Amenities from './components/Amenities';
import Contact from './components/Contact';
import Footer from './components/Footer';
import RoomCard from './components/RoomCard';
import BookingModal from './components/BookingModal';

// Authentication & Page Routes
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import FrontDeskDashboard from './pages/FrontDeskDashboard';
import HousekeepingDashboard from './pages/HousekeepingDashboard';
import FinanceDashboard from './pages/FinanceDashboard';
import ManagerDashboard from './pages/ManagerDashboard';

export default function App() {
  const [viewMode, setViewMode] = useState('guest');
  const [roomClasses, setRoomClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoomClass, setSelectedRoomClass] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // STEP 3 IMPLEMENTATION: Securely check sessionStorage to persist session on refresh.
  // sessionStorage (not localStorage) keeps this scoped to a single tab, so each
  // tab can hold its own independent login and won't be affected by logins or
  // logouts happening in other tabs.
  const [userRole, setUserRole] = useState(() => sessionStorage.getItem('hms_role') || null);
  const [authToken, setAuthToken] = useState(() => sessionStorage.getItem('hms_token') || null);

  const fetchRoomClasses = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/room-classes');
      const json = await response.json();
      setRoomClasses(json.data.roomClasses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomClasses();
  }, []);

  const getUserIdFromToken = () => {
    if (!authToken) return null;
    try {
      const payload = authToken.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.userId;
    } catch (e) {
      return null;
    }
  };

  const scrollToSection = (id) => {
    setViewMode('guest');
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#FDFBF7] text-slate-800 flex flex-col justify-between pt-24">

        <Header
          userRole={userRole}
          setUserRole={setUserRole}
          setAuthToken={setAuthToken}
          viewMode={viewMode}
          setViewMode={setViewMode}
          setIsAuthOpen={setIsAuthOpen}
          scrollToSection={scrollToSection}
        />

        <div className="flex-1">
          <Routes>

            {/* ROUTE 1: Landing Page Container */}
            <Route path="/" element={
              <>
                <main className="w-full">
                  <Hero />
                  <About />
                  <div id="experience-section"><Experience /></div>
                  <Dining />
                  <Gallery />
                  <div id="amenities-section"><Amenities /></div>

                  <div id="rooms-section" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-16 text-center">
                      <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Your Sanctuary</p>
                      <h2 className="text-4xl md:text-5xl font-serif text-zinc-900">Suites & Spaces.</h2>
                      <div className="w-12 h-[1px] bg-orange-200 mx-auto mt-6" />
                    </div>
                    {!loading && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {roomClasses.map((rc) => (
                          <RoomCard
                            key={rc.room_type_id}
                            roomClass={rc}
                            onBookClick={(selectedClass) => {
                              setSelectedRoomClass(selectedClass);
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </main>

                <Contact />
                <Footer scrollToSection={scrollToSection} />
              </>
            } />

            {/* ROUTE 2: Dedicated Unified Login Page */}
            <Route path="/login" element={
              <LoginPage setUserRole={setUserRole} setAuthToken={setAuthToken} />
            } />

            {/* ROUTE 3: PROTECTED FRONT DESK OPERATIONS WORKSPACE */}
            <Route element={<ProtectedRoute isAllowed={userRole === 'FRONT_DESK' || userRole === 'RECEPTION' || userRole === 'ADMIN'} />}>
              <Route path="/dashboard/front-desk" element={<FrontDeskDashboard />} />
            </Route>

            {/* ROUTE 4: PROTECTED HOUSEKEEPING OPERATIONS WORKSPACE */}
            <Route element={<ProtectedRoute isAllowed={userRole === 'HOUSEKEEPING' || userRole === 'ADMIN'} />}>
              <Route path="/dashboard/housekeeping" element={<HousekeepingDashboard />} />
            </Route>

            {/* ROUTE 5: PROTECTED FINANCE WORKSPACE */}
            <Route element={<ProtectedRoute isAllowed={userRole === 'FINANCE' || userRole === 'ADMIN'} />}>
              <Route path="/dashboard/finance" element={<FinanceDashboard />} />
            </Route>

            {/* ROUTE 6: PROTECTED MANAGERIAL COMMAND CENTER */}
            <Route element={<ProtectedRoute isAllowed={userRole?.toUpperCase() === 'ADMIN'} />}>
              <Route path="/dashboard/manager" element={<ManagerDashboard />} />
            </Route>
            {/* Catch-all safety boundary */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </div>

        {/* Transient Booking Overlay Grid */}
        {selectedRoomClass && (
          <BookingModal
            roomClass={selectedRoomClass}
            onClose={() => { setSelectedRoomClass(null); fetchRoomClasses(); }}
          />
        )}

      </div>
    </Router>
  );
}