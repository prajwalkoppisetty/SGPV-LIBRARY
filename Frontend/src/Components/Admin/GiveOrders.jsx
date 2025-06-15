import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SearchBar from './SearchBar';

export default function GiveOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [searchId, setSearchId] = useState('');

  // Fetch all approved orders (not yet given) or by Order_ID if searched
  const fetchOrders = async (orderId = '') => {
    setLoading(true);
    try {
      let res;
      if (orderId) {
        res = await axios.get(`http://localhost:3000/api/auth/admin/orders/search/${orderId}`, { withCredentials: true });
        setOrders(res.data.order && res.data.order.Status === 'approved' ? [res.data.order] : []);
      } else {
        res = await axios.get('http://localhost:3000/api/auth/admin/orders/approved', { withCredentials: true });
        setOrders(res.data.orders || []);
      }
    } catch {
      setOrders([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Handle "Give" action
  const handleGive = async (orderId) => {
    setActionLoading(true);
    setActionMessage('');
    try {
      await axios.post(
        `http://localhost:3000/api/auth/admin/orders/${orderId}/give`,
        {},
        { withCredentials: true }
      );
      setActionMessage('Order marked as given and return deadline emailed to student.');
      fetchOrders();
    } catch {
      setActionMessage('Failed to update order.');
    }
    setActionLoading(false);
  };

  return (
    <div className="w-full max-w-xs p-2 sm:max-w-md md:max-w-3xl md:p-4 mx-auto mt-10 bg-white rounded-xl shadow">
      <div className="mb-4 flex justify-start">
        <SearchBar onSearch={id => {
          setSearchId(id);
          if (id.trim().length === 6) fetchOrders(id.trim());
          if (id.trim() === '') fetchOrders('');
        }} />
      </div>
      <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">Give Orders</h2>
      {actionMessage && (
        <div className="mb-4 text-center text-blue-600 font-semibold">{actionMessage}</div>
      )}
      {actionLoading && (
        <div className="mb-4 text-center text-gray-500 font-semibold">Processing, please wait...</div>
      )}
      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="text-center text-gray-500">No approved orders to give.</div>
      ) : (
        orders.map(order => (
          <div key={order._id} className="mb-6 border-b pb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-blue-600">Order ID: {order.Order_ID}</span>
              <span className="text-sm text-gray-500">{order.Order_Date}</span>
            </div>
            <div>
              <span className="font-semibold">Student:</span>
              <span className="ml-2">{order.User_Name}</span>
            </div>
            <div className="mt-2">
              <span className="font-semibold">Subjects:</span>
              <ul className="list-disc ml-6">
                {order.Subjects && order.Subjects.map((subj, idx) => (
                  <li key={idx}>
                    <span className="font-medium">{subj.code}</span> - {subj.name}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => handleGive(order._id)}
                disabled={actionLoading}
              >
                Give
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
