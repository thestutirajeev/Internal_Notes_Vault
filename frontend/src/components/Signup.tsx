import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    password: '',
    password2: '',
  });
  const [error, setError] = useState<string | { [key: string]: string } | null>(null); // Allow object for field-specific errors
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/users/', formData);
      if (response.status === 201) {
        navigate('/'); // Redirect to login on success
      }
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        // Extract detailed errors from the response
        setError(error.response.data);
      } else {
        setError('Signup failed due to an unexpected error');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
      {error && (
        <div className="mb-4">
          {typeof error === 'string' ? (
            <p className="text-red-500">{error}</p>
          ) : (
            Object.entries(error).map(([field, message]) => (
              <p key={field} className="text-red-500">
                {field}: {Array.isArray(message) ? message.join(', ') : message}
              </p>
            ))
          )}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            placeholder="First Name"
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            placeholder="Last Name"
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            name="password2"
            value={formData.password2}
            onChange={handleChange}
            placeholder="Confirm Password"
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Sign Up
        </button>
      </form>
      <p className="mt-4 text-center">
        Already have an account? <a href="/" className="text-blue-500">Login</a>
      </p>
    </div>
  );
};

export default Signup;