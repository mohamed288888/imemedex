// src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Wallet from './components/Wallet';
import Swap from './components/Swap';
import Tokenomics from './components/Tokenomics';
import Roadmap from './components/Roadmap';
import FAQ from './components/FAQ';
import Header from './components/Header';
import Footer from './components/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <Wallet>
      <Router>
        <div className="App">
          {/* إضافة الهيدر */}
          <Header />

          <main>
            {/* إضافة المسارات للصفحات الجديدة */}
            <Routes>
              <Route path="/" element={<Swap />} /> {/* الصفحة الرئيسية */}
              <Route path="/tokenomics" element={<Tokenomics />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="/faq" element={<FAQ />} />
            </Routes>
          </main>

          {/* إضافة ToastContainer للتنبيهات */}
          <ToastContainer position="top-right" autoClose={5000} />

          {/* إضافة الفوتر */}
          <Footer />
        </div>
      </Router>
    </Wallet>
  );
}

export default App;
