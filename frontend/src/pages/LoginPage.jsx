import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
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
        localStorage.setItem('user', JSON.stringify(data.user));
        // Redirect based on role
        if (data.user.role === 'Admin') {
          navigate('/admin-settings');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("Server connection failed.");
    }
  };

  return (
    <div className="flex min-h-screen bg-black">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1506784919141-177b0ec7190b?q=80&w=2070" 
          alt="Queue Flow" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute bottom-10 left-10 text-white z-10">
          <p className="text-sm font-medium opacity-70">Powered by OfficeQ © 2026</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#121212]">
        <div className="max-w-md w-full bg-[#1E1E1E] p-10 rounded-2xl shadow-2xl border border-gray-800">
          <div className="text-center mb-10">
            <div className="text-officeq-blue text-3xl mb-2 flex justify-center items-center gap-2">
               <span className="bg-officeq-blue text-white p-1 rounded">📋</span> QueueFlow
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Portal Access</h1>
            <p className="text-gray-400">Manage your branch efficiency.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && <p className="text-red-500 text-sm font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-center">{error}</p>}
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="prowler@officeq.com"
                className="w-full bg-[#2A2A2A] border border-gray-700 text-white p-4 rounded-lg focus:outline-none focus:border-officeq-blue transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#2A2A2A] border border-gray-700 text-white p-4 rounded-lg focus:outline-none focus:border-officeq-blue transition-all"
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
    </div>
  );
};

export default LoginPage;