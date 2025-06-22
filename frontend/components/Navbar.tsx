import React from 'react';
import { Page, User } from '../types';
import { AppName, SparklesIcon, GENERIC_USER_AVATAR_URL } from '../constants';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  currentUser: User | null;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, currentUser, onLogout, searchQuery, onSearchChange }) => {
  const navItems = [
    { label: 'Dashboard', page: 'dashboard' as Page, icon: <i className="fas fa-tachometer-alt mr-2"></i> },
    { label: 'Create Event', page: 'createEvent' as Page, icon: <i className="fas fa-plus-circle mr-2"></i> },
    { label: 'AI Planner', page: 'aiRecommendations' as Page, icon: SparklesIcon },
    { label: 'Public Events', page: 'publicEvents' as Page, icon: <i className="fas fa-bullhorn mr-2"></i> },
  ];

  return (
    <nav className="bg-sky-600 text-white shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button onClick={() => onNavigate('dashboard')} className="flex items-center text-2xl font-bold">
              <img src="https://picsum.photos/seed/eventhublogo/40/40" alt="EventHub Logo" className="h-8 w-8 mr-2 rounded-full" />
              {AppName}
            </button>
          </div>

          {/* Desktop Search Bar - Placed after logo, before nav items */}
          <div className="hidden md:flex flex-grow max-w-sm lg:max-w-md xl:max-w-lg items-center ml-4 mr-auto relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-search text-slate-400"></i>
            </div>
            <input
              type="search"
              placeholder="Search events (title, desc, loc, cat)..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-md leading-5 bg-sky-100 text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent sm:text-sm transition-colors"
              aria-label="Search events"
            />
            {searchQuery && (
                <button 
                    onClick={() => onSearchChange('')} 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    aria-label="Clear search"
                >
                    <i className="fas fa-times-circle"></i>
                </button>
            )}
          </div>


          <div className="hidden md:flex items-center space-x-2"> {/* Reduced space for nav items */}
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out
                  ${currentPage === item.page ? 'bg-sky-700 text-white' : 'text-sky-100 hover:bg-sky-500 hover:text-white'}`}
                aria-current={currentPage === item.page ? 'page' : undefined}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>
          
          <div className="flex items-center"> {/* User Auth buttons */}
            {currentUser ? (
              <div className="relative flex items-center ml-3"> {/* Added ml-3 for spacing */}
                 <button onClick={() => onNavigate('profile')} className="flex items-center mr-3 text-sky-100 hover:text-white" aria-label={`View profile for ${currentUser.name}`}>
                    <img src={GENERIC_USER_AVATAR_URL} alt="User Avatar" className="w-8 h-8 rounded-full mr-2 border-2 border-sky-400"/>
                    <span className="hidden sm:inline">{currentUser.name}</span>
                 </button>
                 <button 
                    onClick={onLogout} 
                    className="px-3 py-2 rounded-md text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white transition-colors">
                    Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="ml-3 px-3 py-2 rounded-md text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white transition-colors"
              >
                Login
              </button>
            )}
            <div className="md:hidden ml-2">
                 {/* Mobile menu button can be added here if needed, e.g., to reveal search and nav items */}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu area */}
      <div className="md:hidden border-t border-sky-700" id="mobile-menu">
        {/* Mobile Search Bar */}
        <div className="p-3">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-search text-slate-400"></i>
                </div>
                <input
                  type="search"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-md leading-5 bg-sky-100 text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent sm:text-sm transition-colors"
                  aria-label="Search events mobile"
                />
                {searchQuery && (
                    <button 
                        onClick={() => onSearchChange('')} 
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                        aria-label="Clear search mobile"
                    >
                        <i className="fas fa-times-circle"></i>
                    </button>
                )}
            </div>
        </div>
        {/* Mobile Nav Items */}
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        {navItems.map((item) => (
              <button
                key={`mobile-${item.page}`}
                onClick={() => onNavigate(item.page)}
                className={`w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 ease-in-out
                  ${currentPage === item.page ? 'bg-sky-700 text-white' : 'text-sky-100 hover:bg-sky-500 hover:text-white'}`}
                aria-current={currentPage === item.page ? 'page' : undefined}
              >
                {item.icon} {item.label}
              </button>
            ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;