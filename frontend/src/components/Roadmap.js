// src/components/Roadmap.js

import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';

const roadmapData = [
  { 
    time: 'Q1 2024', 
    title: 'Launch Smart Contracts', 
    description: 'Deploy core smart contracts on Solana for decentralized transactions.' 
  },
  { 
    time: 'Q2 2024', 
    title: 'Integrate Wallets', 
    description: 'Enable wallet integrations such as Phantom, Solflare, and Ledger.' 
  },
  { 
    time: 'Q3 2024', 
    title: 'Community Growth', 
    description: 'Expand community engagement and partnerships to boost adoption.' 
  },
  { 
    time: 'Q4 2024', 
    title: 'DEX Listing', 
    description: 'List the token on decentralized exchanges like Serum and Raydium.' 
  },
  { 
    time: 'Q1 2025', 
    title: 'Enhanced Features', 
    description: 'Introduce staking, liquidity pools, and cross-chain interoperability.' 
  },
];

const timelineVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: index * 0.2 },
  }),
};

const Roadmap = () => {
  return (
    <Container
      maxWidth="xl"
      style={{
        minHeight: '90vh',
        width: '100vw',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#060332',
        color: '#fff',
        overflow: 'hidden',
      }}
    >
      {/* عنوان الصفحة */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography
          variant="h4"
          style={{ color: '#1fc9c0', textAlign: 'center', marginBottom: '20px' }}
        >
         Roadmap
        </Typography>
        <Typography
          variant="body1"
          style={{ color: '#aaa', textAlign: 'center', marginBottom: '40px' }}
        >
          Experience our journey as we build the future of decentralized finance on Solana.
        </Typography>
      </motion.div>

      {/* شريط خارطة الطريق */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr', // عمود واحد على الشاشات الصغيرة
            sm: '1fr 1fr', // عمودان على الشاشات المتوسطة
            md: `repeat(${roadmapData.length}, 1fr)`, // توزيع ديناميكي على الشاشات الكبيرة
          },
          gap: '20px',
          width: '100%',
          padding: '20px',
          boxSizing: 'border-box',
        }}
      >
        {roadmapData.map((item, index) => (
          <motion.div
            key={index}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={timelineVariants}
            style={{
              backgroundColor: '#00264d',
              borderRadius: '10px',
              padding: '20px',
              textAlign: 'center',
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)',
              minHeight: '200px', // ارتفاع مرن
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              color: '#fff',
            }}
          >
            <Typography variant="h6" style={{ color: '#1ee169' }}>
              {item.time}
            </Typography>
            <Typography variant="h5" style={{ color: '#1fc9c0' }}>
              {item.title}
            </Typography>
            <Typography variant="body2" style={{ color: '#aaa' }}>
              {item.description}
            </Typography>
          </motion.div>
        ))}
      </Box>
    </Container>
  );
};

export default Roadmap;
