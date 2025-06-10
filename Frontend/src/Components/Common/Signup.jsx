import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();

  // State for form data
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    pinNumber: '', // Frontend state name
    regulationNumber: '',
    mobileNumber: '', // Frontend state name
    password: '',
    confirmPassword: '',
    branch: '',
    photo: null,
  });

  // State for validation errors
  const [errors, setErrors] = useState({});

  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State for branch dropdown visibility
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);

  // Ref for the hidden file input
  const fileInputRef = useRef(null);

  // State for photo preview
  const [photoPreview, setPhotoPreview] = useState(null);

  // State for loading and general messages (e.g., success/error from API)
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Handle generic input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "regulationNumber") {
      const re = /^\d{0,2}$/;
      if (re.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
      } else if (value.length > 2) {
        setFormData((prev) => ({ ...prev, [name]: value.slice(0, 2) }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Handle branch selection from custom dropdown
  const handleBranchSelect = (selectedBranch) => {
    setFormData((prev) => ({ ...prev, branch: selectedBranch }));
    setErrors((prev) => ({ ...prev, branch: '' }));
    setShowBranchDropdown(false);
  };

  // Handle photo file change
  const handlePhotoChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
      if (selectedFile.size > MAX_FILE_SIZE) {
        setErrors((prev) => ({ ...prev, photo: 'File size exceeds 5MB limit.' }));
        setFormData((prev) => ({ ...prev, photo: null }));
        setPhotoPreview(null);
        e.target.value = null; // Clear the file input
        return;
      }

      if (!selectedFile.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, photo: 'Only image files are allowed.' }));
        setFormData((prev) => ({ ...prev, photo: null }));
        setPhotoPreview(null);
        e.target.value = null; // Clear the file input
        return;
      }

      setFormData((prev) => ({ ...prev, photo: selectedFile }));
      setPhotoPreview(URL.createObjectURL(selectedFile));
      setErrors((prev) => ({ ...prev, photo: '' }));
    } else {
      setFormData((prev) => ({ ...prev, photo: null }));
      setPhotoPreview(null);
      setErrors((prev) => ({ ...prev, photo: '' }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    let isValid = true;

    // Frontend Validations
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!formData.pinNumber.trim()) {
      newErrors.pinNumber = 'Pin number is required';
      isValid = false;
    }
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
      isValid = false;
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Mobile number must be 10 digits';
      isValid = false;
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirm password is required';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    if (!formData.regulationNumber.trim()) {
      newErrors.regulationNumber = 'Regulation number is required';
      isValid = false;
    } else if (!/^\d{2}$/.test(formData.regulationNumber)) {
      newErrors.regulationNumber = 'Regulation number must be 2 digits';
      isValid = false;
    }
    if (!formData.branch) {
      newErrors.branch = 'Please select your branch';
      isValid = false;
    }
    if (!formData.photo) {
      newErrors.photo = 'Please add your photo';
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) {
      setMessage('Please correct the errors in the form.');
      setIsSuccess(false);
      return;
    }

    setLoading(true);
    setMessage('');
    setIsSuccess(false);

    try {
      const dataToSend = new FormData();
      dataToSend.append('email', formData.email);
      dataToSend.append('name', formData.name);
      dataToSend.append('pinNumber', formData.pinNumber); // Using camelCase
      dataToSend.append('regulationNumber', formData.regulationNumber);
      dataToSend.append('mobileNumber', formData.mobileNumber); // Using camelCase
      dataToSend.append('password', formData.password);
      dataToSend.append('branch', formData.branch);
      dataToSend.append('photo', formData.photo); // Multer handles this file

      // Log all data before sending to backend (optional, keep if you find it helpful for debugging)
      const logObj = {};
      dataToSend.forEach((value, key) => {
        logObj[key] = value instanceof File ? value.name : value;
      });
      console.log("Signup data being sent to backend:", logObj);

      // --- Re-enabling the Backend Fetch Call ---
      const response = await fetch('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: dataToSend,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(result.message || 'Signup successful!');
        setIsSuccess(true);
        // Clear form after successful signup
        setFormData({
          email: '',
          name: '',
          pinNumber: '',
          regulationNumber: '',
          mobileNumber: '',
          password: '',
          confirmPassword: '',
          branch: '',
          photo: null,
        });
        setPhotoPreview(null);
        setErrors({});

        // Navigate to Login after a short delay
        setTimeout(() => {
          navigate('/Login');
        }, 2000);

      } else {
        const errorMessage = result.message || 'Signup failed. Please try again.';
        setMessage(errorMessage);
        setIsSuccess(false);

        // Set backend validation errors if provided
        if (result.errors) {
          setErrors(result.errors);
        }
      }
    } catch (error) {
      console.error('Error during signup:', error);
      setMessage('Network error or server is unreachable. Please try again later.');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans">
      <div className="relative min-h-[calc(100vh-80px)] flex flex-col justify-center items-center px-4 py-6">
        <div className="relative max-w-xs sm:max-w-sm md:max-w-md w-full">
          {/* Background Cards */}
          <div className="card bg-blue-400 shadow-lg w-full h-full rounded-3xl absolute transform -rotate-6"></div>
          <div className="card bg-red-400 shadow-lg w-full h-full rounded-3xl absolute transform rotate-6"></div>

          <div className="relative w-full rounded-3xl px-6 py-6 bg-gray-100 shadow-md">
            <h2 className="text-xl font-bold text-center text-gray-700">Sign Up Page</h2>
            <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
              {/* Email Input */}
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email *"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-gray-200 rounded-xl focus:outline-none focus:bg-blue-100"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Name Input */}
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Name *"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-gray-200 rounded-xl focus:outline-none focus:bg-blue-100"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Pin Number Input */}
              <div>
                <input
                  type="text"
                  name="pinNumber"
                  placeholder="Pin Number *"
                  value={formData.pinNumber}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-gray-200 rounded-xl focus:outline-none focus:bg-blue-100"
                />
                {errors.pinNumber && <p className="text-red-500 text-sm mt-1">{errors.pinNumber}</p>}
              </div>

              {/* Mobile Number Input */}
              <div>
                <input
                  type="tel"
                  name="mobileNumber"
                  placeholder="Mobile Number *"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-gray-200 rounded-xl focus:outline-none focus:bg-blue-100"
                />
                {errors.mobileNumber && <p className="text-red-500 text-sm mt-1">{errors.mobileNumber}</p>}
              </div>

              {/* Password Input with Toggle */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password *"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-gray-200 rounded-xl focus:outline-none focus:bg-blue-100 pr-10"
                />
                <span
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={togglePasswordVisibility}
                >
                  <i className={`bx ${showPassword ? 'bx-show' : 'bx-hide'} text-xl text-gray-500`}></i>
                </span>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              {/* Confirm Password Input with Toggle */}
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Your Password *"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-gray-200 rounded-xl focus:outline-none focus:bg-blue-100 pr-10"
                />
                <span
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  <i className={`bx ${showConfirmPassword ? 'bx-show' : 'bx-hide'} text-xl text-gray-500`}></i>
                </span>
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>

              {/* Regulation Number centered row and smaller input */}
              <div className="flex justify-center w-full">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">C -</span>
                  <div>
                    <input
                      type="text"
                      name="regulationNumber"
                      placeholder="Reg Num *"
                      value={formData.regulationNumber}
                      onChange={handleChange}
                      maxLength="2"
                      className="w-28 h-11 px-4 bg-gray-200 rounded-xl focus:outline-none focus:bg-blue-100 text-center"
                    />
                    {errors.regulationNumber && <p className="text-red-500 text-sm mt-1">{errors.regulationNumber}</p>}
                  </div>
                </div>
              </div>

              {/* Branch Selector as Smaller, Centered Button */}
              <div className="relative flex justify-center">
                <button
                  type="button"
                  className="w-32 h-11 bg-blue-600 rounded-xl text-white font-semibold shadow-md hover:bg-blue-700 transition duration-300 flex items-center justify-between px-4"
                  onClick={() => setShowBranchDropdown(!showBranchDropdown)}
                >
                  {formData.branch ? formData.branch : "Branch *"}
                  <i className={`bx bx-chevron-down text-xl transition-transform ${showBranchDropdown ? 'rotate-180' : ''}`}></i>
                </button>
                {errors.branch && <p className="text-red-500 text-sm mt-1 absolute -bottom-6 w-full text-center">{errors.branch}</p>}

                {/* Branch Dropdown Options - adjusted positioning for smaller button */}
                {showBranchDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowBranchDropdown(false)}
                    ></div>
                    <div className="absolute top-full mt-2 w-32 bg-white rounded-xl shadow-lg z-50 overflow-hidden">
                      {['CME', 'CIVIL', 'ECE', 'EEE', 'MECH'].map((option) => (
                        <div
                          key={option}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-800 text-center"
                          onClick={() => handleBranchSelect(option)}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Photo Upload as Smaller, Centered Button */}
              <div className="relative flex justify-center">
                <button
                  type="button"
                  className="w-32 h-11 bg-blue-600 rounded-xl text-white font-semibold shadow-md hover:bg-blue-700 transition duration-300"
                  onClick={() => fileInputRef.current.click()}
                >
                  {formData.photo ? "Change Photo" : "Add Photo *"}
                </button>
                <input
                  type="file"
                  name="photo"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                {errors.photo && <p className="text-red-500 text-sm mt-1 absolute -bottom-6 w-full text-center">{errors.photo}</p>}
              </div>

              {/* Photo preview moved here to be below the button */}
              {photoPreview && (
                <div className="mt-4 flex flex-col items-center">
                  <img src={photoPreview} alt="Selected Preview" className="w-32 h-32 object-cover rounded-lg shadow-md border-2 border-gray-300" />
                  <p className="text-sm mt-2 text-green-600">Selected: {formData.photo.name}</p>
                </div>
              )}

              {/* Loading indicator and message display */}
              {loading && <p className="text-center text-blue-600 mt-4">Signing up...</p>}
              {message && (
                <p className={`text-center mt-4 ${isSuccess ? 'text-green-600' : 'text-red-500'}`}>
                  {message}
                </p>
              )}

              <button
                type="submit"
                className="bg-blue-600 w-full py-3 rounded-xl text-white font-semibold shadow-md hover:bg-blue-700 transition duration-300"
                disabled={loading}
              >
                {loading ? 'Signing Up...' : 'Signup'}
              </button>

              <div className="mt-7 text-center">
                <label htmlFor="Login-link" className="mr-2">Already Have An Account ?</label>
                <Link to="/Login" id="signup-link" className="text-blue-500 transition duration-500 ease-in-out transform hover:-translate-x hover:scale-105">
                  Login Here
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}