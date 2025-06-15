import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SearchBar from './SearchBar';

export default function Order_History() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState('');
  const [filter, setFilter] = useState('all');
  const [showFilter, setShowFilter] = useState(false);

  // Fetch orders based on filter and search
  const fetchHistory = async (orderId = '', status = 'all') => {
    setLoading(true);
    try {
      let res;
      if (orderId) {
        res = await axios.get(`http://localhost:3000/api/auth/admin/orders/search/${orderId}`, { withCredentials: true });
        let orderArr = res.data.order ? [res.data.order] : [];
        if (status !== 'all') {
          orderArr = orderArr.filter(o => o.Status === status);
        }
        setOrders(orderArr);
      } else {
        let url = 'http://localhost:3000/api/auth/admin/orders/history';
        res = await axios.get(url, { withCredentials: true });
        let filtered = res.data.orders || [];
        if (status !== 'all') {
          filtered = filtered.filter(o => o.Status === status);
        }
        setOrders(filtered);
      }
    } catch {
      setOrders([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory('', filter);
  }, [filter]);

  // Handle search
  const handleSearch = (id) => {
    setSearchId(id);
    if (id.trim().length === 6) fetchHistory(id.trim(), filter);
    if (id.trim() === '') fetchHistory('', filter);
  };

  // Change filter options: all, rejected, completed
  const handleFilter = (status) => {
    setFilter(status);
    setShowFilter(false);
    if (searchId.trim().length === 6) fetchHistory(searchId.trim(), status);
    else fetchHistory('', status);
  };

  return (
    <div className="w-full max-w-xs p-2 sm:max-w-md md:max-w-3xl md:p-4 mx-auto mt-10 bg-white rounded-xl shadow relative">
      {/* Top bar with search and filter (search left, filter right) */}
      <div className="flex items-center justify-between mb-4">
        <SearchBar onSearch={handleSearch} />
        <div className="relative">
          <button
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 border border-gray-300"
            onClick={() => setShowFilter(v => !v)}
          >
            <i className="bx bx-filter text-xl"></i>
            <span className="font-semibold capitalize">{filter === 'all' ? 'All' : filter}</span>
            <i className={`bx bx-chevron-down text-lg transition-transform ${showFilter ? 'rotate-180' : ''}`}></i>
          </button>
          {showFilter && (
            <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded shadow z-10">
              <div
                className={`px-4 py-2 cursor-pointer hover:bg-blue-100 ${filter === 'all' ? 'font-bold' : ''}`}
                onClick={() => handleFilter('all')}
              >
                All
              </div>
              <div
                className={`px-4 py-2 cursor-pointer hover:bg-blue-100 ${filter === 'completed' ? 'font-bold' : ''}`}
                onClick={() => handleFilter('completed')}
              >
                Completed
              </div>
              <div
                className={`px-4 py-2 cursor-pointer hover:bg-blue-100 ${filter === 'rejected' ? 'font-bold' : ''}`}
                onClick={() => handleFilter('rejected')}
              >
                Rejected
              </div>
            </div>
          )}
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">Order History</h2>
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
              <span className="font-semibold">Student:</span>
              <span className="ml-2">{order.User_Name}</span>
            </div>
            <div>
              <span className="font-semibold">Status:</span>
              <span className={`ml-2 ${
                order.Status === 'completed'
                  ? 'text-green-600'
                  : order.Status === 'rejected'
                  ? 'text-red-600'
                  : 'text-blue-600'
              }`}>
                {order.Status.charAt(0).toUpperCase() + order.Status.slice(1)}
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
            {order.Status === 'rejected' && order.Reject_Reason && (
              <div className="mt-2 text-red-600">
                <span className="font-semibold">Rejection Reason:</span>
                <span className="ml-2">{order.Reject_Reason}</span>
              </div>
            )}
            {order.Status === 'recieved' && order.Return_Date && (
              <div className="mt-2 text-blue-600">
                <span className="font-semibold">Return Deadline:</span>
                <span className="ml-2">{order.Return_Date}</span>
              </div>
            )}
            {order.Status === 'completed' && order.Returned_Date && (
              <div className="mt-2 text-green-600">
                <span className="font-semibold">Returned Date:</span>
                <span className="ml-2">{order.Returned_Date}</span>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
