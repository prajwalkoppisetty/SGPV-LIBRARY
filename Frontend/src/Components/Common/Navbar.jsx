import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Components.css';
import logo from '../../Assets/logo.png';
import { useAuth } from './AuthContext';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLoggedIn, logout, user } = useAuth();
  const navigate = useNavigate();

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    await logout();
    closeMenu();
    navigate('/Login');
  };

  const commonNavItems = [
    { path: '/', label: 'Home' },
    { path: '/Contact_Us', label: 'Contact Us' },
  ];

  const studentNavItems = [
    { path: '/Profile', label: 'Profile' },
    { path: '/Booklist', label: 'Book List' },
    { path: '/My_Books', label: 'My Books' },
    
    
  ];

  const adminNavItems = [
    { path: '/Profile', label: 'Profile' },
    { path: '/Orders', label: 'Orders' },
    { path: '/Order_History', label: 'Order History' },
    { path: '/Monthly_Report', label: 'Monthly Report' },
    
  ];

  let navItems = [...commonNavItems];

  if (user?.userRole === 'Admin') {
    navItems = [...commonNavItems, ...adminNavItems];
  } else if (user?.userRole === 'student') {
    navItems = [...commonNavItems, ...studentNavItems];
  }

  return (
    <header className='fixed top-0 left-0 w-full z-50 flex justify-between items-center text-black py-6 px-8 md:px-32 bg-white drop-shadow-md'>
      
      {/* Logo */}
      <Link to='/' className='flex items-center hover:scale-105 transition-all' onClick={closeMenu}>
        <img src={logo} alt="Sai Ganapathi Library Logo" className='w-14' />
        <h1 className='text-2xl font-semibold ml-4'>Sai Ganapathi</h1>
      </Link>

      {/* Desktop Navigation */}
      <ul className='hidden xl:flex items-center gap-12 font-semibold text-base'>
        {navItems.map(({ path, label }) => (
          <li key={label}>
            <Link
              to={path}
              className='p-3 block hover:bg-sky-400 hover:text-white rounded-md transition-all cursor-pointer'
              onClick={closeMenu}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Desktop Right Section */}
      <div className='relative hidden xl:flex items-center gap-3 pt-2'>
        {isLoggedIn && user?.userRole !=='Admin' && (
          <Link to="/cart" className="flex items-center justify-center mr-5">
            <i className="bx bx-cart text-2xl hover:text-blue-600 transition" title="Cart"></i>
          </Link>
        )}
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5"
          >
            Logout
          </button>
        ) : (
          <Link to="/Login">
            <button
              className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5"
            >
              Login
            </button>
          </Link>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <i
        className={`bx ${isMenuOpen ? 'bx-x' : 'bx-menu'} xl:hidden block text-5xl cursor-pointer`}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      ></i>

      {/* Mobile Menu */}
      <div
        className={`
          absolute xl:hidden top-full left-0 w-full bg-white flex flex-col items-center
          font-semibold text-lg drop-shadow-md z-10 transition-all duration-300
          ${isMenuOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-4 invisible'}
        `}
      >
        <ul className="w-full">
          {navItems.map(({ path, label }) => (
            <li
              key={label}
              onClick={closeMenu}
              className="w-full text-center p-4 hover:bg-sky-400 hover:text-white transition-all border-b border-gray-200"
            >
              <Link to={path} className="block w-full h-full">{label}</Link>
            </li>
          ))}

          {isLoggedIn && user?.userRole !=='Admin' && (
            <li
              onClick={closeMenu}
              className="w-full text-center p-4 hover:bg-sky-400 hover:text-white transition-all border-b border-gray-200 flex items-center justify-center gap-2"
            >
              <Link to="/cart" className="flex items-center gap-2">
                <i className="bx bx-cart text-2xl"></i>
                <span>Cart</span>
              </Link>
            </li>
          )}

          <li
            onClick={isLoggedIn ? handleLogout : closeMenu}
            className="w-full text-center p-4 hover:bg-sky-400 hover:text-white transition-all"
          >
            {isLoggedIn ? (
              <span className="block w-full h-full">Logout</span>
            ) : (
              <Link to="/Login" className="block w-full h-full">Login</Link>
            )}
          </li>
        </ul>
      </div>
    </header>
  );
}

export default Navbar;
