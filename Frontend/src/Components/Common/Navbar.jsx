// src/Components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Components.css';
import logo from '../../Assets/logo.png';
import { useAuth } from './AuthContext'; // Corrected import path for Auth context (assuming it's in src/AuthContext.js)

function Navbar() {
  const [isMenuOpen, setisMenuOpen] = useState(false);
  const { isLoggedIn, logout } = useAuth(); // Destructure isLoggedIn and logout from Auth context
  const navigate = useNavigate(); // Initialize useNavigate

  // Function to close the mobile menu
  const closeMenu = () => {
    setisMenuOpen(false);
  };

  // Logout handler
  const handleLogout = async () => {
    await logout();
    closeMenu(); // Close mobile menu (good practice even for desktop logout)
    navigate('/Login');
  };

  return (
    <header className='fixed top-0 left-0 w-full z-50 flex justify-between items-center text-black py-6 px-8 md:px-32 bg-white drop-shadow-md'>
      {/* Logo and Site Title - Link to Home, closes menu if open */}
      <Link to='/' className='flex items-center hover:scale-105 transition-all' onClick={closeMenu}>
        <img src={logo} alt="Sai Ganapathi Library Logo" className='w-14' />
        <h1 className='text-2xl font-semibold ml-4'>Sai Ganapathi</h1>
      </Link>

      {/* Main Navigation Links (Desktop) */}
      <ul className='hidden xl:flex items-center gap-12 font-semibold text-base'>
        {/* ⭐⭐⭐ Changes start here for desktop navigation items ⭐⭐⭐ */}
        <li>
          <Link to="/" className='p-3 block hover:bg-sky-400 hover:text-white rounded-md transition-all cursor-pointer'>Home</Link>
        </li>
        <li>
          <Link to="/Profile" className='p-3 block hover:bg-sky-400 hover:text-white rounded-md transition-all cursor-pointer'>Profile</Link>
        </li>
        <li>
          <Link to="/Booklist" className='p-3 block hover:bg-sky-400 hover:text-white rounded-md transition-all cursor-pointer'>Book List</Link>
        </li>
        <li>
          <Link to="/My_Books" className='p-3 block hover:bg-sky-400 hover:text-white rounded-md transition-all cursor-pointer'>My Books</Link>
        </li>
        <li>
          <Link to="/Contact_Us" className='p-3 block hover:bg-sky-400 hover:text-white rounded-md transition-all cursor-pointer'>Contact Us</Link>
        </li>
        {/* ⭐⭐⭐ Changes end here ⭐⭐⭐ */}
      </ul>

      {/* Login/Logout Button for Desktop */}
      <div className='relative hidden xl:flex items-center gap-3 pt-2'>
        {isLoggedIn && (
          <Link to="/cart" className="flex items-center justify-center mr-5">
            <i className="bx bx-cart text-2xl hover:text-blue-600 transition" title="Cart"></i>
          </Link>
        )}
        {isLoggedIn ? (
          <button
            type="button"
            onClick={handleLogout}
            className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
          >
            Logout
          </button>
        ) : (
          <Link to="/Login">
            <button type="button" className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">Login</button>
          </Link>
        )}
      </div>

      {/* Mobile Menu Icon */}
      <i
        className={`bx ${isMenuOpen ? 'bx-x' : 'bx-menu'} xl:hidden block text-5xl cursor-pointer`}
        onClick={() => setisMenuOpen(!isMenuOpen)}
      ></i>

      {/* Mobile Menu Overlay */}
      <div
        className={`
          absolute xl:hidden top-full left-0 w-full bg-white flex flex-col items-center
          font-semibold text-lg drop-shadow-md z-10
          ${isMenuOpen ? "opacity-100 translate-y-0 visible" : "opacity-0 -translate-y-4 invisible"}
        `}
      >
        <ul className="w-full">
          {/* Mobile Menu Links - Each li now closes menu and navigates on click */}
          <li
            className="list-none w-full text-center p-4 hover:bg-sky-400 hover:text-white transition-all cursor-pointer border-b border-gray-200"
            onClick={closeMenu}
          >
            <Link to="/" className="block w-full h-full">Home</Link>
          </li>
          <li
            className="list-none w-full text-center p-4 hover:bg-sky-400 hover:text-white transition-all cursor-pointer border-b border-gray-200"
            onClick={closeMenu}
          >
            <Link to="/Profile" className="block w-full h-full">Profile</Link>
          </li>
          <li
            className="list-none w-full text-center p-4 hover:bg-sky-400 hover:text-white transition-all cursor-pointer border-b border-gray-200"
            onClick={closeMenu}
          >
            <Link to="/Booklist" className="block w-full h-full">Book List</Link>
          </li>
          <li
            className="list-none w-full text-center p-4 hover:bg-sky-400 hover:text-white transition-all cursor-pointer border-b border-gray-200"
            onClick={closeMenu}
          >
            <Link to="/My_Books" className="block w-full h-full">My Books</Link>
          </li>
          <li
            className="list-none w-full text-center p-4 hover:bg-sky-400 hover:text-white transition-all cursor-pointer border-b border-gray-200"
            onClick={closeMenu}
          >
            <Link to="/Contact_Us" className="block w-full h-full">Contact Us</Link>
          </li>
          {/* Mobile Login/Logout Link */}
          {isLoggedIn && (
            <li
              className="list-none w-full text-center p-4 hover:bg-sky-400 hover:text-white transition-all cursor-pointer border-b border-gray-200 flex items-center justify-center gap-2"
              onClick={closeMenu}
            >
              <Link to="/cart" className="block w-full h-full flex items-center justify-center gap-2">
                <i className="bx bx-cart text-2xl"></i>
                <span>Cart</span>
              </Link>
            </li>
          )}
          <li
            className="list-none w-full text-center p-4 hover:bg-sky-400 hover:text-white transition-all cursor-pointer"
            onClick={isLoggedIn ? handleLogout : closeMenu}
          >
            {isLoggedIn ? (
              <span className="block w-full h-full cursor-pointer">Logout</span>
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