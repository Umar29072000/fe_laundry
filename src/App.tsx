/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Services from './pages/Services';
import Orders from './pages/Orders';
import TrackOrder from './pages/TrackOrder';
import Receipt from './pages/Receipt';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
 const token = localStorage.getItem('auth_token');
 if (!token) {
 return <Navigate to="/login" replace />;
 }
 return <>{children}</>;
};

export default function App() {
 return (
 <BrowserRouter>
 <Routes>
 <Route path="/login" element={<Login />} />
 <Route path="/register" element={<Register />} />
 <Route path="/track/:orderId" element={<TrackOrder />} />
 <Route path="/receipt/:orderId" element={<Receipt />} />
 <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
 <Route index element={<Dashboard />} />
 <Route path="customers" element={<Customers />} />
 <Route path="services" element={<Services />} />
 <Route path="orders" element={<Orders />} />
 <Route path="reports" element={<Reports />} />
 <Route path="profile" element={<Profile />} />
 </Route>
 </Routes>
 </BrowserRouter>
 );
}
