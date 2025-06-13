import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full mt-4 py-6 bg-gray-100 text-center text-gray-500 text-sm">
      &copy; {new Date().getFullYear()} Sai Ganapathi Library. All rights reserved.
    </footer>
  );
}
