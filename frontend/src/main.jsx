import React from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './auth.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <App />
    <Toaster position="bottom-center" toastOptions={{ duration: 3000 }} />
  </AuthProvider>
);
