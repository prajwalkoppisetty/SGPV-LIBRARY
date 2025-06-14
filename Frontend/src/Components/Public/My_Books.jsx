import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function My_Books() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get the user's name from localStorage (as stored in your login logic)
  const userData = localStorage.getItem('user');
  const userName = userData ? JSON.parse(userData).name : null;

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        // Fetch all orders for this user from backend
        const res = await axios.get('http://localhost:3000/api/auth/my_orders', { withCredentials: true });
        let userOrders = res.data.orders || [];

        // Filter by user name from localStorage (if needed)
        if (userName) {
          userOrders = userOrders.filter(order => order.User_Name === userName);
        }

        // Sort by Order_Date (latest first, format: DD-MM-YYYY)
        userOrders.sort((a, b) => {
          const [da, ma, ya] = a.Order_Date.split('-').map(Number);
          const [db, mb, yb] = b.Order_Date.split('-').map(Number);
          const dateA = new Date(ya, ma - 1, da);
          const dateB = new Date(yb, mb - 1, db);
          return dateB - dateA;
        });

        setOrders(userOrders);
      } catch (err) {
        setOrders([]);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [userName]);

  return (
    <div className="w-full max-w-xs p-2 sm:max-w-md md:max-w-2xl md:p-4 mx-auto mt-10 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">My Orders</h2>
      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="text-center text-gray-500">No orders found.</div>
      ) : (
        orders.map(order => (
          <div key={order._id} className="mb-6 border-b pb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-blue-600">Order ID: {order.Order_ID}</span>
              <span className="text-sm text-gray-500">{order.Order_Date}</span>
            </div>
            <div>
              <span className="font-semibold">Status:</span>
              <span className={`ml-2 ${order.Status === 'pending' ? 'text-yellow-600' : order.Status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                {order.Status}
              </span>
            </div>
            <div className="mt-2">
              <span className="font-semibold">Subjects:</span>
              <ul className="list-disc ml-6">
                {order.Subjects.map((subj, idx) => (
                  <li key={idx}>
                    <span className="font-medium">{subj.code}</span> - {subj.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
