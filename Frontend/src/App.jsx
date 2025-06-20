// src/App.js
import React from 'react';
import { Routes,Route } from 'react-router-dom';



import './index.css';

//Common Components
import Navbar from './Components/Common/Navbar';
import Home  from './Components/Common/Home';
import Login from './Components/Common/Login';
import Signup from './Components/Common/Signup';
import Page_Not_Available from './Components/Common/Page_Not_Available';

//Public Components
import BookList from './Components/Public/BookList';
import Contact_Us from './Components/Public/Contact_Us';
import My_Books from './Components/Public/My_Books';
import Profile from './Components/Public/Profile';
import Cart from './Components/Public/Cart';
import Footer from './Components/Common/Footer';

//Admin Components
import Orders from './Components/Admin/Orders';
import Order_History from './Components/Admin/Order_History';
import Monthly_Report from './Components/Admin/Monthly_Report';
import { useAuth } from './Components/Common/AuthContext'; // Import Auth context

import GiveOrders from './Components/Admin/GiveOrders';
import TakenBooks from './Components/Admin/TakenBooks';

// AdminRoute component for admin-only access
function AdminRoute({ children }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="text-center mt-10">Checking access...</div>;
  if (!user || user.userRole !== 'Admin') {
    return <div className="text-center mt-10 text-red-600 font-bold">Access denied.Can Be Accessed By Admins only.</div>;
  }
  return children;
}

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {/* Main content area grows to fill available space */}
      <div className="flex-1 w-full pt-24 md:pt-28">
        <Routes>
          <Route path='/' element={<Home/>}></Route>
          <Route path='/Booklist' element={<BookList/>}></Route>
          <Route path='/Contact_Us' element={<Contact_Us/>}></Route>
          <Route path='/My_Books' element={<My_Books/>}></Route>
          <Route path='/Login' element={<Login/>}></Route>
          <Route path='/Signup' element={<Signup/>}></Route>
          <Route path='/Profile' element={<Profile/>}></Route>
          <Route path='/Cart' element={<Cart/>}></Route>
          <Route path='/*' element={<Page_Not_Available/>}></Route>
          {/* Add more routes as needed */}

          {/* Admin Routes */}
          <Route path='/Orders' element={
            <AdminRoute>
              <Orders/>
            </AdminRoute>
          }/>
          <Route path='/Order_History' element={
            <AdminRoute>
              <Order_History/>
            </AdminRoute>
          }/>
          <Route path='/Monthly_Report' element={
            <AdminRoute>
              <Monthly_Report/>
            </AdminRoute>
          }/>
          <Route path='/GiveOrders' element={
            <AdminRoute>
              <GiveOrders/>
            </AdminRoute>
          }/>
          <Route path='/TakeOrders' element={
            <AdminRoute>
              <TakenBooks/>
            </AdminRoute>
          }/>
          
          {/* Catch-all route for undefined paths */}
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;