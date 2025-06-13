import React, { useEffect, useState } from 'react';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [showCheckoutOverlay, setShowCheckoutOverlay] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('cartItems');
    if (stored) {
      setCartItems(JSON.parse(stored));
    }
  }, []);

  const handleRemove = (code) => {
    const updated = cartItems.filter((item) => item.code !== code);
    setCartItems(updated);
    localStorage.setItem('cartItems', JSON.stringify(updated));
  };

  const handleCheckout = () => {
    console.log('Checked out:', cartItems);
    setCartItems([]);
    localStorage.removeItem('cartItems');
    setShowCheckoutOverlay(true);
    setTimeout(() => setShowCheckoutOverlay(false), 2000);
  };

  return (
    <div className="flex flex-col items-center min-h-[70vh] pt-10 px-2 bg-gradient-to-br">
      {/* Checkout Success Popup */}
      {showCheckoutOverlay && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg animate-fade-in">
          <i className="bx bx-check-circle text-2xl"></i>
          <span className="font-semibold">Checkout successful!</span>
        </div>
      )}

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 animate-fade-in-up">
        <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">Your Cart</h2>

        {cartItems.length === 0 ? (
          <div className="text-center text-gray-500 py-8 animate-fade-in">No items in cart.</div>
        ) : (
          <table className="w-full mb-6">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 px-3">Code</th>
                <th className="py-2 px-3">Name</th>
                <th className="py-2 px-3 text-center">Remove</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map(({ code, name }, idx) => (
                <tr key={code} className="border-b last:border-b-0 animate-fade-in" style={{ animationDelay: `${0.1 * idx}s`, animationFillMode: 'forwards' }}>
                  <td className="py-2 px-3">{code}</td>
                  <td className="py-2 px-3">{name}</td>
                  <td className="py-2 px-3 text-center">
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleRemove(code)}
                      title="Remove"
                    >
                      <i className="bx bx-trash text-xl"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="flex justify-center">
          <button
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            disabled={cartItems.length === 0}
            onClick={handleCheckout}
          >
            Checkout
          </button>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.7s cubic-bezier(.68,-0.55,.27,1.55);
        }
        .animate-fade-in {
          opacity: 0;
          animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
