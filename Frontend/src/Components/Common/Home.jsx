import React from 'react'
import { useAuth } from './AuthContext'

// Branches data with BoxIcons (or similar) and colors
const branches = [
  {
    name: "CME",
    icon: <i className="bx bx-chip text-4xl text-blue-600"></i>,
    color: "bg-blue-100",
    desc: "Computer Engineering"
  },
  {
    name: "CIVIL",
    icon: <i className="bx bx-building-house text-4xl text-green-600"></i>,
    color: "bg-green-100",
    desc: "Civil Engineering"
  },
  {
    name: "ECE",
    icon: <i className="bx bx-broadcast text-4xl text-pink-600"></i>,
    color: "bg-pink-100",
    desc: "Electronics & Communication"
  },
  {
    name: "EEE",
    icon: <i className="bx bx-bolt-circle text-4xl text-yellow-500"></i>,
    color: "bg-yellow-100",
    desc: "Electrical & Electronics"
  },
  {
    name: "MECH",
    icon: <i className="bx bx-cog text-4xl text-gray-700"></i>,
    color: "bg-gray-100",
    desc: "Mechanical Engineering"
  }
];

export default function Home() {
  const { isLoggedIn, user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen items-center w-full">
      {/* Fade entire content at once */}
      <div className="w-full animate-fade-in">
        {/* Hero Section */}
        <div className="w-full bg-gradient-to-r from-blue-400 to-emerald-400 py-12 px-4 flex flex-col items-center">
          {/* College Logo */}
          <div
            className="flex flex-col items-center mb-4"
            style={{ animationDelay: '0.05s', animationFillMode: 'forwards' }}
          >
            <div className="bg-white rounded-full p-3 shadow-md">
              <img
                src="/logo.png"
                alt="Sai Ganapathi Logo"
                className="w-24 h-20 mb-2"
                style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.10))" }}
              />
            </div>
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold mb-1 text-white tracking-tight text-center"
            style={{ letterSpacing: "0.01em", animationDelay: '0.15s', animationFillMode: 'forwards' }}
          >
            <span className="text-white">Sai </span>
            <span className="text-white">Ganapathi</span>
            <span className="text-white"> Library</span>
          </h1>
          <span
            className="text-base md:text-lg font-semibold text-white tracking-wide text-center"
            style={{ letterSpacing: "0.04em", animationDelay: '0.25s', animationFillMode: 'forwards' }}
          >
            Polytechnic & Engineering College
          </span>
          <p
            className="text-lg md:text-xl text-white mb-4 text-center"
            style={{ animationDelay: '0.35s', animationFillMode: 'forwards' }}
          >
            Empowering Knowledge, One Book at a Time
          </p>
          <p
            className="text-base md:text-lg text-white mb-6 text-center max-w-2xl"
            style={{ animationDelay: '0.45s', animationFillMode: 'forwards' }}
          >
            Welcome to Sai Ganapathi Polytechnic College. Established in the year 2006 by Sri Sai Ganesh Educational & Charitable Trust, Bollili - Sai Ganapathi Polytechnic offers aspiring engineers high quality technical education. It is the first private polytechnic in Visakhapatnam District and second one in the North-Coastal Districts. It has the intakes of 840 seats in all branches and which is the highest intake in the North-Coastal Districts.
          </p>
          <div
            className="flex gap-4 flex-wrap justify-center"
            style={{ animationDelay: '0.55s', animationFillMode: 'forwards' }}
          >
            <a href="/Booklist" className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-xl shadow hover:bg-blue-100 transition">Browse Books</a>
            <a href="/My_Books" className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-xl shadow hover:bg-blue-100 transition">My Books</a>
            <a href="/Profile" className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-xl shadow hover:bg-blue-100 transition">Profile</a>
          </div>
          {/* Available Branches - moved here */}
          <div className="w-full max-w-4xl mt-8 px-4 flex flex-col items-center">
  <h2
    className="text-2xl font-bold mb-4 text-center text-blue-700"
    style={{ animationDelay: '0.65s', animationFillMode: 'forwards' }}
  >
    Available Branches
  </h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-12 justify-items-center">
    {branches.map((branch, idx) => (
      <div
        key={branch.name}
        className={`w-full max-w-[260px] min-h-[170px] rounded-xl shadow-lg p-6 flex flex-col items-center text-center justify-center ${branch.color} animate-pop-in`}
        style={{ animationDelay: `${0.7 + idx * 0.07}s`, animationFillMode: 'forwards' }}
      >
        {branch.icon}
        <div className="font-bold mt-2 text-lg text-blue-700">{branch.name}</div>
        <div className="text-sm text-gray-600 text-center">{branch.desc}</div>
      </div>
    ))}
  </div>
</div>

        </div>
        {/* Stats */}
      </div>
      <style>{`
        .animate-fade-in {
          opacity: 0;
          animation: fadeIn 0.35s cubic-bezier(.68,-0.55,.27,1.55) forwards;
        }
        .animate-pop-in {
          opacity: 0;
          transform: scale(0.8);
          animation: popIn 0.18s cubic-bezier(.68,-0.55,.27,1.55) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0;}
          to { opacity: 1;}
        }
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.8);}
          80% { opacity: 1; transform: scale(1.05);}
          100% { opacity: 1; transform: scale(1);}
        }
      `}</style>
    </div>
  );
}
