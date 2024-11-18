// src/components/FAQ.js
import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Container } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { motion } from 'framer-motion';

const FAQ = () => {
  const faqs = [
    { question: "What is IMEME?", answer: "IMEME is a decentralized platform on the Solana blockchain that enables secure and fast transactions." },
    { question: "How to buy IMEME tokens?", answer: "You can buy IMEME tokens by connecting your wallet to a decentralized exchange such as Raydium or Serum." },
    { question: "What wallets are supported?", answer: "IMEME supports wallets like Phantom, Solflare, and Ledger for secure transactions." },
    { question: "Is IMEME safe?", answer: "Yes, IMEME utilizes Solana's secure and decentralized architecture to ensure safety and scalability." },
    { question: "What is Solana?", answer: "Solana is a high-performance blockchain platform designed for decentralized applications and crypto projects." },
    { question: "What are the benefits of IMEME?", answer: "IMEME offers fast transactions, low fees, and a secure ecosystem for decentralized finance." },
    { question: "How to stake IMEME tokens?", answer: "You can stake IMEME tokens directly through our staking portal and earn rewards." },
    { question: "What is the total supply of IMEME tokens?", answer: "The total supply of IMEME tokens is 10 billion." },
    { question: "How can I join the IMEME community?", answer: "You can join our community through social media channels and participate in discussions and events." },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <Container
      maxWidth={false}
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        minHeight: 'calc(100vh - 60px)', // حساب ارتفاع الفوتر
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#060332',
        color: '#FFF',
        overflowY: 'auto',
        padding: '20px',
        boxSizing: 'border-box',
        paddingBottom: '60px', // حجز مساحة للفوتر
      }}
    >
      <Typography variant="h4" style={{ textAlign: 'center', marginBottom: '20px', color: '#1fc9c0', width: '100%' }}>
        Frequently Asked Questions
      </Typography>
      <Typography variant="body1" style={{ textAlign: 'center', marginBottom: '20px', color: '#aaa', width: '100%' }}>
        Find answers to your questions about IMEME and its ecosystem.
      </Typography>
      {faqs.map((faq, index) => (
        <motion.div key={index} variants={itemVariants} style={{ width: '100%' }}>
          <Accordion style={{ backgroundColor: '#00264d', color: '#FFF', marginBottom: '10px', borderRadius: '10px', width: '100%' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon style={{ color: '#FFF' }} />}>
              <Typography variant="h6" style={{ fontWeight: 'bold', width: '100%' }}>{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" style={{ lineHeight: '1.6', width: '100%' }}>{faq.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        </motion.div>
      ))}
    </Container>
  );
};

export default FAQ;
