import React, { useRef, useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [show, setShow] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef();

  const handleIconClick = () => {
    setShow(true);
    setTimeout(() => inputRef.current && inputRef.current.focus(), 100);
  };

  const handleBlur = () => {
    setTimeout(() => setShow(false), 150);
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <div className="relative flex items-center">
      <button
        className="text-gray-500 hover:text-blue-600 focus:outline-none transition"
        onClick={handleIconClick}
        aria-label="Search"
        type="button"
      >
        <i className="bx bx-search text-2xl"></i>
      </button>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Search orders ID"
        className={`
          absolute left-10 top-1/2 transform -translate-y-1/2
          bg-white border border-gray-300 rounded-full px-4 py-2 w-0 opacity-0
          transition-all duration-300 ease-in-out shadow-lg
          focus:w-56 focus:opacity-100 focus:pl-4
          ${show ? 'w-56 opacity-100 pl-4' : ''}
        `}
        style={{ minWidth: show ? 180 : 0 }}
      />
    </div>
  );
}
