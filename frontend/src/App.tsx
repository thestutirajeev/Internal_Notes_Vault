import React, {useState, useEffect} from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './components/Login';
import Notes from './components/Notes';
import Signup from './components/Signup';
import './App.css';

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    window.location.href = '/'; // Redirect to login page on logout
  };

  return (
    <div className="container mx-auto p-4">
      <Routes>
        <Route path='/' element={token ? <Navigate to="/notes" /> : <Login setToken={setToken} />} />
        <Route path="/signup" element={token ? <Navigate to="/notes" replace /> : <Signup />} />
        <Route path='/notes' element={token ? <Notes token={token} handleLogout={handleLogout} /> :<Navigate to="/" />} />
        
      </Routes>
    </div>
  );
};

export default App;