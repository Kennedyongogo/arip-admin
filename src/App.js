import React from "react";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
// Create a theme instance


function App() {
  return (
   
      <Router>
        <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
          {/* Add more routes here as needed */}
        </Routes>
      </Router>
   
  );
}

export default App;
