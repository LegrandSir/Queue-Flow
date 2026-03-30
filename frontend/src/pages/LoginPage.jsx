import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Call the onLogin prop to update App state
        if (onLogin) onLogin(data.user);
        // Navigate based on role
        if (data.user.role === 'Admin') {
          navigate('/admin-settings');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Server connection failed.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-2xl border border-gray-100">
        <div className="text-center mb-10">
          <div className="text-officeq-blue text-3xl mb-2 flex justify-center items-center gap-2">
            <span className="bg-officeq-blue text-white p-1 rounded">📋</span> QueueFlow
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Portal Access</h1>
          <p className="text-gray-500">Manage your branch efficiency.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <p className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-lg border border-red-200 text-center">
              {error}
            </p>
          )}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="prowler@officeq.com"
              className="w-full border border-gray-300 text-gray-900 p-4 rounded-lg focus:outline-none focus:border-officeq-blue transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-300 text-gray-900 p-4 rounded-lg focus:outline-none focus:border-officeq-blue transition-all"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-officeq-blue text-white font-bold rounded-lg hover:bg-blue-600 transition-all shadow-lg"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

