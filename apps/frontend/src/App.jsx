import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';


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

// Onboarding & Licensing
import SetupWizard from './pages/SetupWizard';
import SystemLocked from './pages/SystemLocked';
import LicenseWarningBanner from './components/LicenseWarningBanner';

// Authentication & Page Routes
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import FrontDeskDashboard from './pages/FrontDeskDashboard';
import HousekeepingDashboard from './pages/HousekeepingDashboard';
import FinanceDashboard from './pages/FinanceDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SalesDashboard from './pages/SalesDashboard';
import TravelDashboard from './pages/TravelDashboard';
import DiningDashboard from './pages/DiningDashboard';
import WorkspaceSelector from './pages/WorkspaceSelector';


export default function App() {
  const [systemStatus, setSystemStatus] = useState('loading'); // 'loading', 'setup_required', 'locked', 'active'
  const [viewMode, setViewMode] = useState('guest');
  const [roomClasses, setRoomClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoomClass, setSelectedRoomClass] = useState(null);
  const [, setIsAuthOpen] = useState(false);

  // Sync state with sessionStorage
  const [userRole, setUserRole] = useState(() => sessionStorage.getItem('hms_role') || null);
  const [authToken, setAuthToken] = useState(() => sessionStorage.getItem('hms_token') || null);
  const [userDepartments, setUserDepartments] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('hms_department')) || [];
    } catch {
      return [];
    }
  });
  const [licenseExpiresAt, setLicenseExpiresAt] = useState(() => {
    const val = sessionStorage.getItem('hms_expires_at');
    return val ? parseInt(val, 10) : null;
  });

  // Listen for storage changes to keep state in sync across components
  useEffect(() => {
    const handleStorageChange = () => {
      setUserRole(sessionStorage.getItem('hms_role'));
      try {
        setUserDepartments(JSON.parse(sessionStorage.getItem('hms_department')) || []);
      } catch {
        setUserDepartments([]);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const hasAccess = (dept) => {
    if (!userRole) return false;
    const role = userRole.toUpperCase();
    if (role.includes('SUPER_ADMIN') || role.includes('ADMIN')) return true;
    if (role.includes(dept)) return true;
    if (Array.isArray(userDepartments) && userDepartments.some(d => d.includes(dept))) return true;
    if (dept === 'FRONTDESK' && (role.includes('FRONT_DESK') || role.includes('RECEPTION') || (Array.isArray(userDepartments) && (userDepartments.some(d => d.includes('FRONT_DESK') || d.includes('RECEPTION')))))) return true;
    return false;
  };

  useEffect(() => {
    const initSystem = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/setup/init');
        const data = await res.json();
        setSystemStatus(data.status);
        if (data.expiresAt) {
          setLicenseExpiresAt(data.expiresAt);
          sessionStorage.setItem('hms_expires_at', data.expiresAt);
        }
      } catch (err) {
        console.error("System init error", err);
        setSystemStatus('active'); // fallback
      }
    };
    initSystem();
  }, []);

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

  if (systemStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mb-4"></div>
          <p className="text-slate-600 uppercase tracking-widest text-xs font-bold">Booting HMS...</p>
        </div>
      </div>
    );
  }

  if (systemStatus === 'setup_required') {
    return <SetupWizard onComplete={() => setSystemStatus('locked')} />;
  }

  if (systemStatus === 'locked') {
    return <SystemLocked onUnlock={(token, user, expiresAt) => {
      sessionStorage.setItem('hms_token', token);
      sessionStorage.setItem('hms_role', user.role);
      if (expiresAt) {
        sessionStorage.setItem('hms_expires_at', expiresAt);
        setLicenseExpiresAt(expiresAt);
      }
      setAuthToken(token);
      setUserRole(user.role);
      setSystemStatus('active');
    }} />;
  }

  const scrollToSection = (id) => {
    setViewMode('guest');
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#FDFBF7] text-slate-800 flex flex-col justify-between pt-24">
        
        <div className="fixed top-0 left-0 w-full z-50 flex flex-col">
          <LicenseWarningBanner expiresAt={licenseExpiresAt} />
          <Header
            userRole={userRole}
            setUserRole={setUserRole}
            setAuthToken={setAuthToken}
            viewMode={viewMode}
            setViewMode={setViewMode}
            setIsAuthOpen={setIsAuthOpen}
            scrollToSection={scrollToSection}
          />
        </div>

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
            <Route path="/workspace-selector" element={
              authToken && userRole !== 'GUEST' ? <WorkspaceSelector /> : <Navigate to="/login" replace />
            } />

            {/* ROUTE 3: PROTECTED FRONT DESK OPERATIONS WORKSPACE */}
            <Route element={<ProtectedRoute isAllowed={hasAccess('FRONTDESK')} />}>
              <Route path="/dashboard/front-desk" element={<FrontDeskDashboard />} />
            </Route>

            {/* ROUTE 4: PROTECTED HOUSEKEEPING OPERATIONS WORKSPACE */}
            <Route element={<ProtectedRoute isAllowed={hasAccess('HOUSEKEEPING')} />}>
              <Route path="/dashboard/housekeeping" element={<HousekeepingDashboard />} />
            </Route>

            {/* ROUTE 5: PROTECTED FINANCE WORKSPACE */}
            <Route element={<ProtectedRoute isAllowed={hasAccess('FINANCE')} />}>
              <Route path="/dashboard/finance" element={<FinanceDashboard />} />
            </Route>

            {/* ROUTE: PORTFOLIO COMMAND CENTER */}
            <Route element={<ProtectedRoute isAllowed={userRole?.toUpperCase() === 'SUPER_ADMIN'} />}>
              <Route path="/dashboard/super-admin" element={<AdminDashboard />} />
            </Route>

            {/* ROUTE 6: PROTECTED ADMIN DASHBOARD */}
            <Route element={<ProtectedRoute isAllowed={userRole?.toUpperCase() === 'ADMIN' || userRole?.toUpperCase() === 'SUPER_ADMIN'} />}>
              <Route path="/dashboard/Admin" element={<AdminDashboard />} />
            </Route>

            {/* ROUTE 7: PROTECTED SALES DASHBOARD */}
            <Route element={<ProtectedRoute isAllowed={hasAccess('SALES')} />}>
              <Route path="/dashboard/sales" element={<SalesDashboard />} />
            </Route>

            {/* ROUTE 8: PROTECTED TRAVEL DESK ROUTE */}
            <Route element={<ProtectedRoute isAllowed={hasAccess('TRAVEL')} />}>
              <Route path="/dashboard/travel" element={<TravelDashboard />} />
            </Route>

            {/* ROUTE 9: CORRECTED SINGLE PROTECTED DINING ROUTE */}
            <Route element={<ProtectedRoute isAllowed={hasAccess('RESTAURANT')} />}>
              <Route path="/dashboard/dining" element={<DiningDashboard />} />
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
