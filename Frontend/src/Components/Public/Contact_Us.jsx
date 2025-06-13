import React from 'react'

export default function Contact_Us() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-10 bg-gradient-to-br">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full flex flex-col items-center animate-fade-in-up">
        <h2 className="text-3xl font-bold text-blue-700 mb-6">Contact Info</h2>
        <div className="flex flex-col gap-6 w-full">
          <div className="flex items-center gap-4 animate-fade-in">
            <i className="bx bx-phone-call text-2xl text-emerald-500 animate-pulse"></i>
            <span className="text-lg font-semibold text-gray-700">Phone:</span>
            <span className="text-gray-600">8142308438, 9581467711</span>
          </div>
          <div className="flex items-center gap-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <i className="bx bx-envelope text-2xl text-blue-500 animate-pulse"></i>
            <span className="text-lg font-semibold text-gray-700">Email:</span>
            <span className="text-gray-600 break-all">principal.saiganapathi@gmail.com</span>
          </div>
          <div className="flex items-center gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <i className="bx bx-map text-2xl text-pink-500 animate-pulse"></i>
            <span className="text-lg font-semibold text-gray-700">Location:</span>
            <span className="text-gray-600">Gidijala (v), Anandapuram, Visakhapatnam</span>
          </div>
        </div>
      </div>
      {/* Simple fade-in keyframes */}
      <style>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.7s cubic-bezier(.68,-0.55,.27,1.55);
        }
        .animate-fade-in {
          animation: fadeIn 1s cubic-bezier(.68,-0.55,.27,1.55);
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px);}
          to { opacity: 1; transform: translateY(0);}
        }
        @keyframes fadeIn {
          from { opacity: 0;}
          to { opacity: 1;}
        }
      `}</style>
    </div>
  )
}
