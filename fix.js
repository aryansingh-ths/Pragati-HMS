const fs = require('fs');
const file = 'apps/frontend/src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// The file is currently totally broken. Let's fix it by looking for the broken block and replacing it.
const brokenStartIndex = content.indexOf('<p className="text-xs text-white/85 mt-0.5">Provision accounts, configure permissions, and monitor shift activity.</p>');
const brokenEndIndex = content.indexOf('<div className="space-y-2.5">', brokenStartIndex);

if (brokenStartIndex !== -1 && brokenEndIndex !== -1) {
  const replacement = `<p className="text-xs text-white/85 mt-0.5">Provision accounts, configure permissions, and monitor shift activity.</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setShowOnboardModal(true); setOnboardSuccess(null); setOnboardError(null); }}
                      className="relative bg-white text-[#D4A373] hover:bg-zinc-50 font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition-all overflow-hidden"
                    >
                      <motion.span animate={{ rotate: [0, 90, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} className="inline-flex">
                        <Plus size={14} />
                      </motion.span>
                      Add Employee
                    </motion.button>
                  </motion.div>

                  {/* ✨ DEPARTMENT & PROPERTY FILTER TABS ✨ */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white/60 backdrop-blur-sm border border-zinc-200/60 rounded-2xl p-2 shadow-sm mb-4">
                    {/* Role/Department Filters */}
                    <div className="flex-1 flex flex-wrap gap-2">
                      {[
                        { key: 'ALL', label: 'All Staff' },
                        { key: 'FRONT_DESK', label: 'Front Desk' },
                        { key: 'HOUSEKEEPING', label: 'Housekeeping' },
                        { key: 'Admin', label: 'Admin' },
                        { key: 'FINANCE', label: 'Finance' },
                        { key: 'RESTAURANT', label: 'Dining' },
                        { key: 'SALES', label: 'Sales' },
                        { key: 'TRAVEL', label: 'Travel' }
                      ].map(tab => (
                        <motion.button
                          key={tab.key}
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setStaffFilter(tab.key)}
                          className={\`relative z-10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors overflow-hidden \${staffFilter === tab.key
                            ? 'text-white'
                            : 'bg-white text-zinc-500 border border-zinc-200/60 hover:bg-zinc-50 hover:text-zinc-800'
                            }\`}
                        >
                          {staffFilter === tab.key && (
                            <motion.span
                              layoutId="hr-filter-pill"
                              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                              className={\`absolute inset-0 bg-[#D4A373] shadow-md rounded-full\`}
                            />
                          )}
                          <span className="relative">{tab.label}</span>
                        </motion.button>
                      ))}
                    </div>

                    {/* Property Filter Dropdown */}
                    <div className="relative shrink-0">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                      <select
                        value={propertyFilter}
                        onChange={(e) => setPropertyFilter(e.target.value)}
                        className="w-48 pl-9 pr-8 py-1.5 bg-white border border-zinc-200 rounded-xl text-[10px] font-bold text-zinc-700 outline-none focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] appearance-none shadow-sm cursor-pointer"
                      >
                        <option value="ALL">All Properties</option>
                        <option value="GLOBAL">Global / Unassigned</option>
                        {hotels.map(h => (
                          <option key={h.id} value={h.id}>{h.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* ✨ LIVE STAFF DIRECTORY GRID ✨ */}
                  `;
                  
  const newContent = content.substring(0, brokenStartIndex) + replacement + content.substring(brokenEndIndex);
  
  // also fix the filter array condition
  const fixedContent = newContent.replace(
    ".filter(sp => staffFilter === 'ALL' || sp.role === staffFilter)",
    ".filter(sp => (staffFilter === 'ALL' || sp.role === staffFilter) && (propertyFilter === 'ALL' || sp.hotel_id === propertyFilter || (propertyFilter === 'GLOBAL' && !sp.hotel_id)))"
  );
  
  fs.writeFileSync(file, fixedContent);
  console.log('Fixed file layout successfully.');
} else {
  console.log('Could not find boundaries.');
}
