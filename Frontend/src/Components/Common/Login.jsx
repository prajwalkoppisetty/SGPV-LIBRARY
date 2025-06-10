import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate

export default function Login() {
  const navigate = useNavigate(); // Initialize useNavigate

  // State to manage password visibility
  const [showPassword, setShowPassword] = useState(false);

  // State to store all form input values in a single object
  const [formData, setFormData] = useState({
    email: '', // ⭐ Change from pinNumber to email
    password: '',
  });

  // State for messages (e.g., login errors, success)
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);


  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Generic handler for input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev, // Keep existing form data
      [name]: value // Update the specific field by its 'name' attribute
    }));
  };

  const handleLogin = async (e) => { // Make function async
    e.preventDefault(); // Prevent default form submission

    setMessage(''); // Clear previous messages
    setIsError(false);
    setLoading(true);

    // Basic frontend validation
    if (!formData.email.trim() || !formData.password.trim()) {
      setMessage('Please enter both email and password.');
      setIsError(true);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email, // ⭐ Send email
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(result.message || 'Login successful!');
        setIsError(false);
        console.log('Login successful:', result);
        // Optionally store user ID or token (e.g., in localStorage)
        // localStorage.setItem('userId', result.userId);
        // localStorage.setItem('userRole', result.userRole);

        // Redirect to a dashboard or home page after successful login
        // You'll need to define your routes
       navigate('/')


      } else {
        setMessage(result.message || 'Login failed. Please check your credentials.');
        setIsError(true);
      }
    } catch (error) {
      console.error('Error during login:', error);
      setMessage('Network error or server is unreachable. Please try again later.');
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
              <div> {/* ⭐ Changed from Pin Number to Email */}
                <input
                  type="email" // Use type="email" for better accessibility and validation
                  name="email"
                  placeholder="Enter Your Email" // ⭐ Changed placeholder
                  className="mt-1 block w-full border-none bg-gray-100 h-11 rounded-xl shadow-lg hover:bg-blue-100 focus:bg-blue-100 focus:ring-0 text-center"
                  value={formData.email}
                  onChange={handleChange}
                  required // Make email required
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
                  required // Make password required
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
                <p className={`text-center mt-4 ${isError ? 'text-red-500' : 'text-green-600'}`}>
                  {message}
                </p>
              )}


              {/* Login Button */}
              <div className="mt-7">
                <button
                  type="submit"
                  className="bg-blue-500 w-full py-3 rounded-xl text-white shadow-xl hover:shadow-inner focus:outline-none transition duration-500 ease-in-out transform hover:-translate-x hover:scale-105"
                  disabled={loading} // Disable button while loading
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