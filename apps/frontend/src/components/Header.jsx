import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCircle, Menu, X, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

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
  const navigate = useNavigate(); 
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = ['Home', 'About', 'Experience', 'Dining', 'Gallery', 'Suites', 'Contact Us'];

  const getDashboardPath = (role) => {
    const r = role.toLowerCase();
    if (r === 'admin') return '/dashboard/manager';
    if (r === 'housekeeping') return '/dashboard/housekeeping';
    if (r === 'finance') return '/dashboard/finance';
    return '/dashboard/front-desk';
  };

  const isStaffRole = (role) =>
    ['admin', 'staff', 'reception', 'front_desk', 'housekeeping', 'finance'].includes(
      role?.toLowerCase()
    );

  return (
    // FIX 1: overflow-hidden on the header itself prevents any child from
    // escaping the viewport width. This is the hard backstop.
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 w-full z-50 overflow-hidden transition-colors duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-lg shadow-sm py-3' 
          : location.pathname.startsWith('/dashboard')
            ? 'bg-white/50 backdrop-blur-md py-4'
            : 'bg-white py-5'
      }`}
    >
      {/* FIX 2: The inner container is already max-w-7xl and px-safe, but we
          also add min-w-0 so flex children can shrink below their content size
          rather than pushing the container wider. */}
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2 md:gap-4 min-w-0"
      >
        
        {/* LEFT: Branding — shrink-0 is correct here, logo should never squish */}
        <motion.div 
          className="flex items-center gap-3 cursor-pointer group shrink-0 -ml-4 sm:-ml-9 lg:-ml-12"
          onClick={() => {
            navigate('/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <img 
            src="/images/techhansa-logo.png" 
            alt="Logo" 
            className="w-20 h-20 md:w-20 md:h-20 object-contain transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<span class="text-orange-500 text-[11px] font-bold">LOGO</span>';
            }}
          />
          
          {/* Adjusted font sizes to be a little larger */}
          <span className="text-2xl md:text-2xl font-serif italic font-bold tracking-tight flex items-center drop-shadow-sm" style={{ color: '#e4aa19ff' }}>
            Pragati
            <span className="font-light ml-2 uppercase text-xl md:text-xl tracking-widest" style={{ color: '#e4a215ff', opacity: 0.8 }}>
              HMS
            </span>
          </span>
        </motion.div>

        {/* CENTER: Desktop Navigation */}
        {location.pathname === '/' && (
          <motion.nav className="hidden lg:flex items-center gap-3 xl:gap-8 justify-center flex-1">
            {navItems.map((item, index) => {
              const sectionId = item === 'Home' ? '' : 
                              item === 'Contact Us' ? 'contact-section' : 
                              item === 'Suites' ? 'rooms-section' :
                              `${item.toLowerCase()}-section`;
              return (
                <motion.div 
                  layout
                  key={item}
                  className="relative px-1 py-2 cursor-pointer shrink-0"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => {
                    navigate('/');
                    setTimeout(() => {
                      item === 'Home'
                        ? window.scrollTo({ top: 0, behavior: 'smooth' })
                        : scrollToSection(sectionId);
                    }, 50);
                  }}
                >
                  <span className="text-[10px] xl:text-xs font-bold uppercase tracking-[0.1em] text-zinc-600 hover:text-orange-600 transition-colors whitespace-nowrap">
                    {item}
                  </span>
                  
                  {hoveredIndex === index && (
                    <motion.div
                      layoutId="header-underline"
                      className="absolute left-0 -bottom-1 w-full h-[2px] bg-orange-500 rounded-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </motion.div>
              );
            })}
          </motion.nav>
        )}

        <motion.div className="flex items-center justify-end gap-1.5 md:gap-3 min-w-0">
          <AnimatePresence mode="popLayout">
            {userRole ? (
              <motion.div 
                key="logged-in"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                // FIX 4: min-w-0 on this inner flex so children can shrink.
                // gap-1.5 on mobile keeps buttons close together.
                className="flex items-center gap-1.5 md:gap-3 min-w-0"
              >
                {/* Role badge — hidden on mobile, fine */}
                <span className="hidden sm:inline-block text-[9px] md:text-[10px] font-bold text-zinc-800 bg-orange-50 px-3 py-1.5 rounded-md border border-orange-200 uppercase tracking-widest whitespace-nowrap shrink-0">
                  Role: <span className="text-orange-600">{userRole.replace('_', ' ')}</span>
                </span>
                
                {!location.pathname.includes('/dashboard') && isStaffRole(userRole) && (
                  <>
                    {/* FIX 5: On mobile show only a compact icon button for
                        "Open Operations" — the text label was too wide and
                        was the main source of overflow at small viewports.
                        On sm+ screens show the full text label as before. */}
                    
                    {/* Mobile: icon-only */}
                    <button
                      onClick={() => navigate(getDashboardPath(userRole))}
                      className="sm:hidden flex items-center justify-center w-8 h-8 rounded-md bg-zinc-900 hover:bg-orange-600 transition-colors shrink-0"
                      aria-label="Open Operations"
                    >
                      <Settings size={14} className="text-white" />
                    </button>

                    {/* sm+: full label */}
                    <button 
                      onClick={() => navigate(getDashboardPath(userRole))}
                      className="hidden sm:inline-block text-[11px] md:text-sm font-bold text-white bg-zinc-900 hover:bg-orange-600 transition-colors px-4 py-2 rounded-md shadow-sm whitespace-nowrap shrink-0"
                    >
                      Open Operations
                    </button>
                  </>
                )}
                
                {/* FIX 6: Remove the mr-2 sm:mr-0 — that margin was adding
                    extra space to the right of the button, compounding the
                    overflow instead of fixing it. Flex gap handles spacing. */}
                <button 
                  onClick={() => { 
                    setUserRole(null); 
                    setAuthToken(null); 
                    setViewMode('guest'); 
                    // sessionStorage is per-tab, so this only logs out the
                    // current tab and leaves other tabs' sessions untouched.
                    sessionStorage.removeItem('hms_token'); 
                    sessionStorage.removeItem('hms_role'); 
                    navigate('/'); 
                  }} 
                  className="text-[11px] md:text-sm font-bold text-rose-500 hover:text-rose-700 transition-colors whitespace-nowrap shrink-0"
                >
                  Log Out
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="logged-out"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => navigate('/login')}
                // FIX 7: Remove mr-2 sm:mr-0 here too — same issue, the
                // margin was causing right-side overflow on mobile.
                className="flex items-center gap-2 px-5 py-2.5 text-[11px] md:text-sm font-bold tracking-wide bg-orange-400 text-white rounded-md hover:bg-orange-500 hover:-translate-y-0.5 transition-all duration-300 shadow-md hover:shadow-lg whitespace-nowrap shrink-0"
              >
                <UserCircle size={16} /> Sign In
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

      </motion.div>
    </motion.header>
  );
}