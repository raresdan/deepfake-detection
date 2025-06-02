import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage/LandingPage";
import Register from "./features/auth/Register";
import Login from "./features/auth/Login";
import Dashboard from "./pages/Dashboard/Dashboard";

const App: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard/*" element={<Dashboard/>} />
    </Routes>
  </Router>
);

export default App;
