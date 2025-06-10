// src/Components/Navbar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import '../Components.css'; 
import logo from '../../Assets/logo.png';

function Navbar() {
  const [isMenuOpen, setisMenuOpen] = useState(false);

  // Function to close the mobile menu
  const closeMenu = () => {
    setisMenuOpen(false);
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
        <li className='p-3 hover:bg-sky-400 hover:text-white rounded-md transition-all cursor-pointer'>
          <Link to="/">Home</Link>
        </li>
        <li className='p-3 hover:bg-sky-400 hover:text-white rounded-md transition-all cursor-pointer'>
          <Link to="/Booklist">Book List</Link>
        </li>
        <li className='p-3 hover:bg-sky-400 hover:text-white rounded-md transition-all cursor-pointer'>
          <Link to="/My_Books">My Books</Link>
        </li>
        <li className='p-3 hover:bg-sky-400 hover:text-white rounded-md transition-all cursor-pointer'>
          <Link to="/Contact_Us">Contact Us</Link>
        </li>
      </ul>

      {/* Login Button for Desktop/Larger Screens */}
      <div className='relative hidden xl:flex items-center gap-3 pt-2'>
        <Link to="/Login"> {/* Changed button to Link */}
          <button type="button" className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">Login</button>
        </Link>
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
          {/* Mobile Login Link */}
          <li
            className="list-none w-full text-center p-4 hover:bg-sky-400 hover:text-white transition-all cursor-pointer"
            onClick={closeMenu}
          >
            <Link to="/Login" className="block w-full h-full">Login</Link>
          </li>
        </ul>
      </div>
    </header>
  );
}

export default Navbar;
