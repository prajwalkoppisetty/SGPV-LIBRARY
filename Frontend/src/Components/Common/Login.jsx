// frontend/src/Common/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios
import { useAuth } from './AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); // Destructure the login function from AuthContext

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing again
    if (message) {
      setMessage('');
      setIsError(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage('');
    setIsError(false);
    setLoading(true);

    if (!formData.email.trim() || !formData.password.trim()) {
      setMessage('Please enter both email and password.');
      setIsError(true);
      setLoading(false);
      return;
    }

    try {
      // ⭐⭐⭐ Use axios for the request ⭐⭐⭐
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        email: formData.email,
        password: formData.password,
      }, {
        withCredentials: true, // ⭐ CRUCIAL for sending/receiving HTTP-only cookies
      });

      console.log('Login successful:', response.data);
      setMessage(response.data.message || 'Login successful!');
      setIsError(false);

      // Call the login function from AuthContext
      login(response.data.user);

      // Print user role after successful login
      console.log('User role:', response.data.user?.userRole);

      // Log all cookies (note: HTTP-only cookies like 'token' will NOT be visible here)
      console.log('All cookies:', document.cookie);

      // Redirect if backend sends a redirect field
      if (response.data.redirect) {
        navigate(response.data.redirect);
      } else {
        // Fallback: Redirect after a short delay for the message to be seen
        
        setTimeout(() => {
          navigate('/'); // Redirect to the home page or dashboard
        }, );
      }

    } catch (error) {
      console.error('Error during login:', error);
      // Handle different types of errors from axios
      if (error.response) {
        // Server responded with a status code outside of 2xx range
        setMessage(error.response.data.message || 'Login failed. Please check your credentials.');
      } else if (error.request) {
        // The request was made but no response was received
        setMessage('No response from server. Please try again later.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setMessage('An unexpected error occurred. Please try again.');
      }
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans">
      <div className="relative min-h-[calc(100vh-80px)] flex flex-col justify-center items-center">
        <div className="relative max-w-xs sm:max-w-sm md:max-w-md w-full">
          {/* Card background layers */}
          <div className="card bg-blue-400 shadow-lg w-full h-full rounded-3xl absolute transform -rotate-6"></div>
          <div className="card bg-red-400 shadow-lg w-full h-full rounded-3xl absolute transform rotate-6"></div>

          {/* Main login card */}
          <div className="relative w-full rounded-3xl px-6 py-4 bg-gray-100 shadow-md">
            <label htmlFor="login-heading" className="block mt-3 text-gray-700 text-center text-xl font-bold">
              Login
            </label>
            <form className="mt-10" onSubmit={handleLogin}>
              {/* Email Input */}
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter Your Email"
                  className="mt-1 block w-full border-none bg-gray-100 h-11 rounded-xl shadow-lg hover:bg-blue-100 focus:bg-blue-100 focus:ring-0 text-center"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Password Input with Show/Hide Button */}
              <div className="mt-7 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter Your Password"
                  className="mt-1 block w-full border-none bg-gray-100 h-11 rounded-xl shadow-lg hover:bg-blue-100 focus:bg-blue-100 focus:ring-0 text-center pr-10"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 cursor-pointer"
                  style={{ top: '50%', transform: 'translateY(-50%)' }}
                >
                  {showPassword ? (
                    <i className='bx bx-show text-2xl transition-all duration-300'></i>
                  ) : (
                    <i className='bx bx-hide text-2xl transition-all duration-300'></i>
                  )}
                </button>
              </div>

              {/* Remember Me Checkbox */}
              <div className="mt-7 flex">
                <label htmlFor="remember_me" className="inline-flex items-center w-full cursor-pointer">
                  <input
                    id="remember_me"
                    type="checkbox"
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    name="remember"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Remember Me
                  </span>
                </label>
              </div>

              {/* Message display for login */}
              {loading && <p className="text-center text-blue-600 mt-4">Logging in...</p>}
              {message && (
                <p className={`text-center mt-4 ${isError ? 'text-red-500' : 'text-green-600'}`}>              {/* Redirect to home if login is successful and backend sends redirect */}
                  {message}
                </p>
              )}

              {/* Login Button */}
              <div className="mt-7">
                <button
                  type="submit"
                  className="bg-blue-500 w-full py-3 rounded-xl text-white shadow-xl hover:shadow-inner focus:outline-none transition duration-500 ease-in-out transform hover:-translate-x hover:scale-105"
                  disabled={loading}
                >
                  {loading ? 'Logging In...' : 'Login'}
                </button>
              </div>

              {/* Create Account Link */}
              <div className="mt-7">
                <div className="flex justify-center items-center">
                  <label htmlFor="signup-link" className="mr-2">Are You New ?</label>
                  <Link to="/signup" id="signup-link" className="text-blue-500 transition duration-500 ease-in-out transform hover:-translate-x hover:scale-105">
                    Signup Here
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}