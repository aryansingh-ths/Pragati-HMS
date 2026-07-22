import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCircle, Settings, Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = ['Home', 'About', 'Experience', 'Dining', 'Gallery', 'Suites', 'Contact Us'];
const GOLD = '#C9971E';

export default function Header({
  userRole,
  setUserRole,
  setAuthToken,
  viewMode,
  setViewMode,
  setIsAuthOpen,
  scrollToSection
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close the mobile nav whenever the route changes
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  const getDashboardPath = (role) => {
    const r = role.toLowerCase();
    if (r === 'admin') return '/dashboard/Admin';
    if (r === 'housekeeping') return '/dashboard/housekeeping';
    if (r === 'finance') return '/dashboard/finance';
    if (r === 'sales') return '/dashboard/sales';
    if (r === 'travel') return '/dashboard/travel';
    if (r === 'restaurant') return '/dashboard/dining'; 
    return '/dashboard/front-desk';
  };

  const isStaffRole = (role) =>
    ['admin', 'staff', 'reception', 'front_desk', 'housekeeping', 'finance', 'sales', 'travel', 'restaurant'].includes(
      role?.toLowerCase()
    );

  const isHome = location.pathname === '/';
  const isDashboard = location.pathname.startsWith('/dashboard');

  const handleNavClick = (item) => {
    const sectionId =
      item === 'Home' ? '' :
        item === 'Contact Us' ? 'contact-section' :
          item === 'Suites' ? 'rooms-section' :
            `${item.toLowerCase()}-section`;
    navigate('/');
    setTimeout(() => {
      item === 'Home'
        ? window.scrollTo({ top: 0, behavior: 'smooth' })
        : scrollToSection(sectionId);
    }, 50);
  };

  const handleLogout = () => {
    setUserRole(null);
    setAuthToken(null);
    setViewMode('guest');
    // sessionStorage is per-tab, so this only logs out the current tab
    // and leaves other tabs' sessions untouched.
    sessionStorage.removeItem('hms_token');
    sessionStorage.removeItem('hms_role');
    navigate('/');
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 w-full z-50 h-28 transition-all duration-300 ${isScrolled || isDashboard
          ? 'bg-white/85 backdrop-blur-lg shadow-[0_1px_0_0_rgba(0,0,0,0.06)]'
          : 'bg-white'
        }`}
    >
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">

        {/* Branding */}
        <div
          className="flex items-center gap-3 cursor-pointer shrink-0"
          onClick={() => {
            navigate('/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <div className="w-20 h-20 shrink-0 flex items-center justify-center">
            <img
              src="/images/techhansa-logo.png"
              alt="Pragati HMS"
              className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<span class="text-orange-500 text-[11px] font-bold">LOGO</span>';
              }}
            />
          </div>

          <span
            className="text-3xl leading-none flex items-baseline gap-1.5 whitespace-nowrap"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            <span style={{ color: GOLD, fontWeight: 500 }}>Pragati</span>
            <span
              className="text-2xl uppercase tracking-[0.2em]"
              style={{ color: GOLD, opacity: 0.65, fontWeight: 500 }}
            >
              HMS
            </span>
          </span>
        </div>

        {/* Desktop Navigation */}
        {isHome && (
          <nav className="hidden lg:flex items-center gap-8 flex-1 justify-center">
            {NAV_ITEMS.map((item, index) => (
              <div
                key={item}
                className="relative py-2 cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleNavClick(item)}
              >
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-600 hover:text-orange-600 transition-colors whitespace-nowrap">
                  {item}
                </span>

                {hoveredIndex === index && (
                  <motion.div
                    layoutId="header-underline"
                    className="absolute left-0 -bottom-0.5 w-full h-[2px] bg-orange-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
              </div>
            ))}
          </nav>
        )}

        {/* Right cluster: account controls + mobile nav toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <AnimatePresence mode="wait">
            {userRole ? (
              <motion.div
                key="account"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.25 }}
                className="flex items-center rounded-full border border-zinc-200 bg-zinc-50/80 divide-x divide-zinc-200 overflow-hidden shadow-sm"
              >
                <span className="hidden sm:flex items-center px-4 h-9 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 whitespace-nowrap">
                  <span style={{ color: GOLD }}>{userRole.replace('_', ' ')}</span>
                </span>

                {!isDashboard && isStaffRole(userRole) && (
                  <button
                    onClick={() => navigate(getDashboardPath(userRole))}
                    className="flex items-center gap-1.5 px-4 h-9 text-xs font-semibold text-zinc-800 hover:bg-zinc-900 hover:text-white transition-colors whitespace-nowrap"
                    aria-label="Open Operations"
                  >
                    <Settings size={13} />
                    <span className="hidden sm:inline">Operations</span>
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="px-4 h-9 text-xs font-semibold text-rose-500 hover:bg-rose-50 transition-colors whitespace-nowrap"
                >
                  Log Out
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="signin"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.25 }}
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-5 h-10 text-xs font-semibold tracking-wide bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors shadow-sm hover:shadow-md whitespace-nowrap"
              >
                <UserCircle size={16} /> Sign In
              </motion.button>
            )}
          </AnimatePresence>

          {isHome && (
            <button
              onClick={() => setMobileNavOpen((v) => !v)}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-full border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileNavOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Panel */}
      <AnimatePresence>
        {isHome && mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="lg:hidden overflow-hidden bg-white border-t border-zinc-100 shadow-sm"
          >
            <nav className="flex flex-col px-4 sm:px-6 py-2">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item}
                  onClick={() => handleNavClick(item)}
                  className="text-left text-xs font-semibold uppercase tracking-[0.12em] text-zinc-600 hover:text-orange-600 transition-colors py-3 border-b border-zinc-50 last:border-b-0"
                >
                  {item}
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}