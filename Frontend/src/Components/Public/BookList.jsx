import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../Common/AuthContext';
import subjectsData from '../Common/Subjects';
import { useNavigate } from 'react-router-dom';

const semOrder = ["1ST-SEM", "3RD-SEM", "4TH-SEM", "5TH-SEM"];

export default function BookList() {
  const { user } = useAuth();
  const branch = user?.branch || "CME";
  const branchData = subjectsData[branch] || [];

  const [selectedSem, setSelectedSem] = useState(branchData[0]?.sem || semOrder[0]);
  // selectedSubjects: { [code]: name }
  const [selectedSubjects, setSelectedSubjects] = useState({});
  const [showAddedOverlay, setShowAddedOverlay] = useState(false);

  const buttonRefs = useRef({});
  const [highlightStyle, setHighlightStyle] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const currentBtn = buttonRefs.current[selectedSem];
    if (currentBtn) {
      const { offsetLeft, offsetWidth } = currentBtn;
      setHighlightStyle({
        left: offsetLeft,
        width: offsetWidth,
      });
    }
  }, [selectedSem]);

  const handleSemClick = (sem) => {
    setSelectedSem(sem);
    // Do not clear selectedSubjects, so selections persist across semesters
  };

  const handleSubjectToggle = (code, name) => {
    setSelectedSubjects((prev) => {
      const updated = { ...prev };
      if (updated[code]) {
        delete updated[code];
      } else {
        updated[code] = name;
      }
      return updated;
    });
  };

  const handleAddToCart = () => {
    // Get previous cart items from localStorage
    const prevCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
    // Convert selectedSubjects to an array and sort by code for sequential order
    const newItems = Object.entries(selectedSubjects)
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.code.localeCompare(b.code));
    // Merge and deduplicate by code
    const merged = [
      ...prevCart.filter(
        (item) => !newItems.some((newItem) => newItem.code === item.code)
      ),
      ...newItems,
    ];
    localStorage.setItem('cartItems', JSON.stringify(merged));
    setSelectedSubjects({});
    setShowAddedOverlay(true);
    setTimeout(() => setShowAddedOverlay(false), 2000);
  };

  const currentSemSubjects = branchData.find((s) => s.sem === selectedSem)?.subjects || [];

  return (
    <div className="flex flex-col items-center min-h-[70vh] pt-6 sm:pt-10 px-2">
      {/* Added to Cart Overlay */}
      {showAddedOverlay && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg animate-fade-in">
          <i className="bx bx-check-circle text-2xl"></i>
          <span className="font-semibold">Added to cart</span>
        </div>
      )}
      {/* Semester Tabs with Animation */}
      <div className="relative flex w-full max-w-md sm:max-w-lg md:max-w-xl justify-between mb-8 rounded-full px-1 py-1">
        {/* Animated highlight */}
        <span
          className="absolute top-1 left-0 h-[90%] bg-white rounded-full shadow-md transition-all duration-300 ease-[cubic-bezier(.68,-0.55,.27,1.55)] pointer-events-none"
          style={{
            ...highlightStyle,
            opacity: branchData.some((s) => s.sem === selectedSem) ? 1 : 0.5,
          }}
        />

        {semOrder.map((sem) => {
          const isAvailable = branchData.some((s) => s.sem === sem);
          return (
            <button
              key={sem}
              ref={(el) => (buttonRefs.current[sem] = el)}
              className={`z-10 flex-1 text-center px-3 sm:px-6 md:px-8 py-2 sm:py-4 font-semibold rounded-full transition-colors duration-300 text-sm sm:text-base md:text-lg
                ${selectedSem === sem ? 'text-blue-600' : 'text-gray-700 hover:text-blue-500'}
                ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={() => isAvailable && handleSemClick(sem)}
              disabled={!isAvailable}
            >
              {sem}
            </button>
          );
        })}
      </div>

      {/* Subject List */}
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-white rounded-xl shadow p-4 sm:p-6 md:p-8">
        <div className="flex font-semibold text-gray-700 bg-gray-200 rounded-t-md px-4 sm:px-6 md:px-8 py-3 text-base sm:text-lg md:text-xl">
          <div className="w-1/4">Subject Code</div>
          <div className="w-1/2">Subjects</div>
          <div className="w-1/4 text-center">Select</div>
        </div>

        {currentSemSubjects.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-base sm:text-lg md:text-xl">
            No subjects found for this semester.
          </div>
        ) : (
          currentSemSubjects.map((subject) => (
            <div
              key={subject.code}
              className="flex items-center px-4 sm:px-6 md:px-8 py-3 border-b last:border-b-0 hover:bg-blue-50 text-base sm:text-lg md:text-xl"
            >
              <div className="w-1/4">{subject.code}</div>
              <div className="w-1/2">{subject.name}</div>
              <div className="w-1/4 flex justify-center">
                <input
                  type="checkbox"
                  className="w-6 h-6 accent-blue-600"
                  checked={!!selectedSubjects[subject.code]}
                  onChange={() => handleSubjectToggle(subject.code, subject.name)}
                />
              </div>
            </div>
          ))
        )}

        {/* Add to Cart */}
        <div className="flex justify-center mt-8">
          <button
            className="bg-blue-600 text-white px-8 sm:px-12 md:px-16 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 text-base sm:text-lg md:text-xl"
            disabled={Object.keys(selectedSubjects).length === 0}
            onClick={handleAddToCart}
          >
            Add To Cart
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animate-fade-in {
          animation: fadeIn 0.3s;
        }
      `}</style>
    </div>
  );
}
