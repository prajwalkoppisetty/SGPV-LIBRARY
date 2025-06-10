// src/App.js
import React from 'react';
import { Routes,Route } from 'react-router-dom';

import './index.css';

//Common Components
import Navbar from './Components/Common/Navbar';
import Home  from './Components/Common/Home';
import Login from './Components/Common/Login';
import Signup from './Components/Common/Signup';

//Public Components
import BookList from './Components/Public/BookList';
import Contact_Us from './Components/Public/Contact_Us';
import My_Books from './Components/Public/My_Books';
import Profile from './Components/Public/Profile';

//Admin Components


function App() {
  return (
    <>
      <Navbar />
      
      {/* This div's height will now correctly extend with content due to html/body height: 100% */}
      <div className="w-full min-h-screen pt-24 md:pt-28">
        {/* pt-24 for mobile, pt-28 for md+ screens, matches navbar height */}
        <Routes>
          <Route path='/' element={<Home/>}></Route>
          <Route path='/Booklist' element={<BookList/>}></Route>
          <Route path='/Contact_Us' element={<Contact_Us/>}></Route>
          <Route path='/My_Books' element={<My_Books/>}></Route>
          <Route path='/Login' element={<Login/>}></Route>
          <Route path='/Signup' element={<Signup/>}></Route>
          <Route path='/Profile' element={<Profile/>}></Route>
          {/* Add more routes as needed */}
        </Routes>
      </div>
    </>
  );
}

export default App;