// src/components/Tokenomics.js

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Container, Typography, Card, CardContent, Grid, Box } from '@mui/material';
import { motion } from 'framer-motion'; // استيراد Framer Motion

const data = [
  { name: 'Fair Launch', value: 60 },
  { name: 'Airdrop', value: 15 },
  { name: 'Liquidity', value: 25 },
];

const COLORS = ['#1fc9c0', '#00C49F', '#FF8042'];

const Tokenomics = () => {
  return (
    <Container 
      maxWidth="xl" 
      style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-around', 
        alignItems: 'center', 
        backgroundColor: '#060332', 
        padding: '20px', 
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      {/* بطاقة العدد الإجمالي مع حركة */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card 
          style={{ 
            backgroundColor: '#00264d', 
            color: '#fff', 
            width: '100%', 
            maxWidth: '600px', 
            marginBottom: '20px', 
            textAlign: 'center'
          }}
        >
          <CardContent>
            <Typography variant="h5">Total Supply</Typography>
            <Typography variant="h3">10,000,000,000</Typography>
          </CardContent>
        </Card>
      </motion.div>

      <Typography variant="h4" component="h2" gutterBottom style={{ color: '#ffffff', textAlign: 'center' }}>
        Tokenomics
      </Typography>
      <Typography variant="body1" style={{ marginBottom: '20px', color: '#aaa', textAlign: 'center' }}>
        Discover how our token is distributed across different categories to support a fair and sustainable ecosystem.
      </Typography>

      <Grid container spacing={4} justifyContent="center" style={{ width: '100%', maxWidth: '1200px' }}>
        {data.map((item, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <Card 
                style={{ 
                  backgroundColor: '#00264d', 
                  color: '#fff', 
                  height: '100%', 
                  textAlign: 'center'
                }}
              >
                <CardContent>
                  <Typography variant="h6" style={{ color: COLORS[index] }}>{item.name}</Typography>
                  <Typography variant="h4">{item.value}%</Typography>
                  <Typography variant="body2"></Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <PieChart width={400} height={400} style={{ marginTop: '30px' }}>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            outerRadius={150}
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </motion.div>
    </Container>
  );
};

export default Tokenomics;
