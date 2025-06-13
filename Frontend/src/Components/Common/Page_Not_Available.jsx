import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Page_Not_Available() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br text-slate-800 font-sans">
      <h1 className="text-8xl font-bold text-white m-0">404</h1>
      <h2 className="text-3xl mt-4 mb-2 font-semibold">Page Not Available</h2>
      <p className="text-lg mb-8 text-slate-500 text-center max-w-md">
        Oops! The page you’re looking for doesn’t exist or has been moved.
      </p>
      <button
        onClick={() => navigate('/')}
        className="px-8 py-3 text-lg bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
      >
        Go Home
      </button>
    </div>
  )
}
