import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingOrderId, setRejectingOrderId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch all pending orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3000/api/auth/admin/orders', { withCredentials: true });
      setOrders(res.data.orders || []);
    } catch {
      setOrders([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    // Optionally, add polling or websocket for real-time updates
  }, []);

  // Accept order
  const handleAccept = async (orderId) => {
    setActionMessage('');
    setActionLoading(true);
    try {
      await axios.post(
        `http://localhost:3000/api/auth/admin/orders/${orderId}/accept`,
        {},
        { withCredentials: true }
      );
      setActionMessage('Order accepted and student notified.');
      fetchOrders();
    } catch (err) {
      setActionMessage('Failed to accept order.');
    }
    setActionLoading(false);
  };

  // Reject order
  const handleReject = async (orderId) => {
    if (!rejectReason.trim()) {
      setActionMessage('Please enter a rejection reason.');
      return;
    }
    setActionMessage('');
    setActionLoading(true);
    try {
      await axios.post(
        `http://localhost:3000/api/auth/admin/orders/${orderId}/reject`,
        { reason: rejectReason },
        { withCredentials: true }
      );
      setActionMessage('Order rejected and student notified.');
      setRejectingOrderId(null);
      setRejectReason('');
      fetchOrders();
    } catch (err) {
      setActionMessage('Failed to reject order.');
    }
    setActionLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">Pending Orders</h2>
      {actionMessage && (
        <div className="mb-4 text-center text-blue-600 font-semibold">{actionMessage}</div>
      )}
      {actionLoading && (
        <div className="mb-4 text-center text-gray-500 font-semibold">Processing, please wait...</div>
      )}
      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="text-center text-gray-500">No pending orders.</div>
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
                {order.Subjects.map((subj, idx) => (
                  <li key={idx}>
                    <span className="font-medium">{subj.code}</span> - {subj.name}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={() => handleAccept(order._id)}
                disabled={actionLoading}
              >
                Accept
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                onClick={() => setRejectingOrderId(order._id)}
                disabled={actionLoading}
              >
                Reject
              </button>
            </div>
            {rejectingOrderId === order._id && (
              <div className="mt-3">
                <textarea
                  className="w-full border rounded p-2 mb-2"
                  rows={2}
                  placeholder="Enter rejection reason..."
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  disabled={actionLoading}
                />
                <div className="flex gap-2">
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded"
                    onClick={() => handleReject(order._id)}
                    disabled={actionLoading}
                  >
                    Confirm Reject
                  </button>
                  <button
                    className="bg-gray-300 px-3 py-1 rounded"
                    onClick={() => { setRejectingOrderId(null); setRejectReason(''); }}
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
