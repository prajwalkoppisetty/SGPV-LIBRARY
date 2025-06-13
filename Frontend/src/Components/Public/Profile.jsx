import React from 'react'
import { useAuth } from '../Common/AuthContext'

export default function Profile() {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn || !user) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-lg text-gray-600">You are not logged in.</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[60vh] mt-5 sm:mt-0 px-2">
      <div
        className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 w-full max-w-lg flex flex-col items-center"
        style={{
          minHeight: '320px',
        }}
      >
        {user.file_url && (
          <img
            src={user.file_url}
            alt="Profile"
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-blue-400 mb-4"
          />
        )}
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-center">{user.name}</h2>
        <div className="w-full max-w-md flex flex-col gap-1 mt-2 mx-auto px-4 sm:px-8 md:px-12 lg:px-16">
          <div className="flex gap-2 text-sm sm:text-base md:text-base">
            <span className="font-semibold text-gray-800 min-w-[90px]">Email:</span>
            <span className="text-gray-700 break-all">{user.email}</span>
          </div>
          <div className="flex gap-2 text-sm sm:text-base md:text-base">
            <span className="font-semibold text-gray-800 min-w-[90px]">Mobile:</span>
            <span className="text-gray-700">{user.mobileNumber}</span>
          </div>
          <div className="flex gap-2 text-sm sm:text-base md:text-base">
            <span className="font-semibold text-gray-800 min-w-[90px]">Pin Number:</span>
            <span className="text-gray-700">{user.pinNumber}</span>
          </div>
          <div className="flex gap-2 text-sm sm:text-base md:text-base">
            <span className="font-semibold text-gray-800 min-w-[90px]">Branch:</span>
            <span className="text-gray-700">{user.branch}</span>
          </div>
          <div className="flex gap-2 text-sm sm:text-base md:text-base">
            <span className="font-semibold text-gray-800 min-w-[90px]">Role:</span>
            <span className="text-gray-700">{user.userRole}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
