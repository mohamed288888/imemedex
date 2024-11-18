// frontend/src/components/Swap.js

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  VersionedTransaction,
  Connection,
  clusterApiUrl,
  PublicKey,
} from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { Buffer } from "buffer";
import { tokenList } from "./tokenList.js";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { Button, Spinner, Form } from "react-bootstrap";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { TokenListProvider, ENV as ChainId } from "@solana/spl-token-registry";

const connection = new Connection(clusterApiUrl("mainnet-beta"));
const BACKEND_API_URL = "https://www.imeme.app";

export const fetchQuote = async (data) => {
  const response = await fetch(`${BACKEND_API_URL}/quote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

function Swap() {
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const [fromCurrency, setFromCurrency] = useState("SOL");
  const [toCurrency, setToCurrency] = useState("USDC");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState(null);
  const [convertedAmount, setConvertedAmount] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [customTokens, setCustomTokens] = useState([]);
  const [showFromPopup, setShowFromPopup] = useState(false);
  const [showToPopup, setShowToPopup] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenDecimals, setTokenDecimals] = useState({});

  // Verify backend connection
  useEffect(() => {
    const testBackendConnection = async () => {
      try {
        const response = await axios.get(`${BACKEND_API_URL}/ping`);
        if (response.status === 200) {
          console.log("Connected to backend successfully");
        } else {
          console.error("Backend not responding as expected");
        }
      } catch (error) {
        console.error("Failed to connect to backend:", error);
      }
    };
    testBackendConnection();
  }, []);

  // Fetch token list
  const [allTokens, setAllTokens] = useState([]);

  useEffect(() => {
    const fetchTokenList = async () => {
      try {
        const tokens = await new TokenListProvider().resolve();
        const tokenList = tokens.filterByChainId(ChainId.MainnetBeta).getList();
        setAllTokens(tokenList);
      } catch (error) {
        console.error("Error fetching token list:", error);
      }
    };
    fetchTokenList();
  }, []);

  // Combine token lists
  const currencies = useMemo(() => {
    const popularTokens = tokenList.map((token) => ({
      symbol: token.symbol,
      mint: token.address,
      logoURI: token.logoURI,
    }));
    return [...popularTokens, ...customTokens];
  }, [customTokens]);

  // Create mint address mapping
  const mintAddresses = useMemo(() => {
    const mints = {};
    currencies.forEach((token) => {
      mints[token.symbol] = token.mint;
    });
    return mints;
  }, [currencies]);

  // Fetch token decimals
  const fetchTokenDecimals = useCallback(
    async (mint) => {
      try {
        const tokenInfo = allTokens.find((token) => token.address === mint);
        if (tokenInfo) {
          setTokenDecimals((prev) => ({
            ...prev,
            [mint]: tokenInfo.decimals,
          }));
        } else if (mint === "So11111111111111111111111111111111111111112") {
          // Handle SOL decimals
          setTokenDecimals((prev) => ({
            ...prev,
            [mint]: 9,
          }));
        } else {
          // Fetch decimals from blockchain as a fallback
          const mintInfo = await connection.getParsedAccountInfo(
            new PublicKey(mint)
          );
          const decimals = mintInfo.value?.data?.parsed?.info?.decimals || 0;
          setTokenDecimals((prev) => ({
            ...prev,
            [mint]: decimals,
          }));
        }
      } catch (error) {
        console.error("Error fetching token decimals:", error);
      }
    },
    [allTokens]
  );

  // Fetch decimals for selected currencies
  useEffect(() => {
    if (
      mintAddresses[fromCurrency] &&
      !tokenDecimals[mintAddresses[fromCurrency]]
    ) {
      fetchTokenDecimals(mintAddresses[fromCurrency]);
    }
    if (
      mintAddresses[toCurrency] &&
      !tokenDecimals[mintAddresses[toCurrency]]
    ) {
      fetchTokenDecimals(mintAddresses[toCurrency]);
    }
  }, [
    fromCurrency,
    toCurrency,
    mintAddresses,
    tokenDecimals,
    fetchTokenDecimals,
  ]);

  // Convert amount based on decimals
  const convertAmount = useCallback(
    (amount, currency) => {
      const decimals = tokenDecimals[mintAddresses[currency]] || 0;
      return parseFloat(amount) * Math.pow(10, decimals);
    },
    [tokenDecimals, mintAddresses]
  );

  // Fetch wallet balance
  const fetchWalletBalance = useCallback(async () => {
    if (!publicKey || !mintAddresses[fromCurrency]) {
      return;
    }

    try {
      if (fromCurrency === "SOL") {
        const balance = await connection.getBalance(publicKey);
        setWalletBalance(balance / 1e9); // Convert lamports to SOL
      } else {
        const tokenAccounts = await connection.getTokenAccountsByOwner(
          publicKey,
          {
            mint: new PublicKey(mintAddresses[fromCurrency]),
          }
        );

        let totalBalance = 0;
        for (const accountInfo of tokenAccounts.value) {
          const balance = await connection.getTokenAccountBalance(
            accountInfo.pubkey
          );
          totalBalance += parseFloat(balance.value.amount);
        }

        const decimals = tokenDecimals[mintAddresses[fromCurrency]] || 0;
        setWalletBalance(totalBalance / Math.pow(10, decimals));
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  }, [publicKey, fromCurrency, mintAddresses, tokenDecimals]);

  useEffect(() => {
    fetchWalletBalance();
  }, [fetchWalletBalance]);

  // Load custom tokens from localStorage
  useEffect(() => {
    const storedTokens = JSON.parse(localStorage.getItem("customTokens")) || [];
    setCustomTokens(storedTokens);
  }, []);

  // Fetch price
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await axios.get(
          `https://api.jup.ag/price/v2?ids=${mintAddresses[fromCurrency]}&vsToken=${mintAddresses[toCurrency]}`
        );

        console.log("Price API V2 Response:", response.data);

        const fetchedPrice =
          response.data.data[mintAddresses[fromCurrency]]?.price;
        if (!fetchedPrice) {
          console.error(`No price found for ${fromCurrency} to ${toCurrency}`);
          setPrice(null);
          toast.warn(
            `Price not available for ${fromCurrency} to ${toCurrency}`
          );
        } else {
          setPrice(parseFloat(fetchedPrice));
          if (fetchedPrice && amount) {
            setConvertedAmount((amount * fetchedPrice).toFixed(8));
          }
        }
      } catch (error) {
        console.error("Error fetching price:", error);
        toast.error("Failed to fetch price");
      }
    };

    if (fromCurrency && toCurrency) {
      fetchPrice();
    }
  }, [fromCurrency, toCurrency, amount, mintAddresses]);

  // Update converted amount
  useEffect(() => {
    if (price && amount) {
      setConvertedAmount((amount * price).toFixed(8));
    } else {
      setConvertedAmount("");
    }
  }, [price, amount]);

  // Handle swap
  const handleCompleteSwap = useCallback(async () => {
    try {
      if (!publicKey) {
        alert("Connect your wallet first");
        return;
      }

      const amountValue = convertAmount(parseFloat(amount), fromCurrency);

      const quoteResponse = await axios.post(`${BACKEND_API_URL}/quote`, {
        inputMint: mintAddresses[fromCurrency],
        outputMint: mintAddresses[toCurrency],
        amount: amountValue,
        slippageBps: 50,
        userPublicKey: publicKey.toBase58(),
      });

      if (!quoteResponse.data || !quoteResponse.data.swapTransaction) {
        throw new Error("Transaction data is incomplete");
      }

      const swapTransactionBuffer = Buffer.from(
        quoteResponse.data.swapTransaction,
        "base64"
      );

      const transaction = VersionedTransaction.deserialize(
        swapTransactionBuffer
      );

      const signature = await sendTransaction(transaction, connection);

      const confirmation = await connection.confirmTransaction(
        {
          signature,
          commitment: "confirmed",
        },
        60000 // وقت الانتظار بالملي ثانية (60 ثانية)
      );

      if (confirmation.value.err) {
        throw new Error(
          `Transaction failed: ${JSON.stringify(confirmation.value.err)}`
        );
      }

      toast.success("Transaction successful with signature: " + signature);
    } catch (error) {
      console.error("Error during swap:", error);
      toast.error("Error during swap: " + error.message);
    }
  }, [
    publicKey,
    fromCurrency,
    toCurrency,
    amount,
    sendTransaction,
    mintAddresses,
    convertAmount,
  ]);

  // Handle adding custom token
  const isValidMintAddress = (mint) => {
    try {
      new PublicKey(mint); // إذا لم يكن العنوان صالحًا ستظهر خطأ
      return true;
    } catch (error) {
      return false;
    }
  };

  const fetchTokenInfo = async (mint) => {
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/solana/contract/${mint}`
      );
      if (response.status === 404) {
        throw new Error(`Token not found for mint address: ${mint}`);
      }
      const tokenData = response.data;
      const tokenInfo = {
        symbol: tokenData.symbol.toUpperCase(),
        mint: mint,
        logoURI: tokenData.image.thumb,
      };
      return tokenInfo;
    } catch (error) {
      console.error("Error fetching token info:", error);
      toast.error(`Token information not found: ${error.message}`);
      return null;
    }
  };

  const handleAddToken = async (mint) => {
    if (currencies.find((token) => token.mint === mint)) {
      toast.info("Token already exists");
      return;
    }

    const tokenInfo = await fetchTokenInfo(mint);
    if (tokenInfo) {
      const updatedTokens = [
        ...customTokens,
        {
          symbol: tokenInfo.symbol,
          mint: tokenInfo.mint,
          logoURI: tokenInfo.logoURI,
        },
      ];
      setCustomTokens(updatedTokens);

      localStorage.setItem("customTokens", JSON.stringify(updatedTokens));
      toast.success("Token added successfully");
    } else {
      toast.error("Token not found or not supported.");
    }
  };

  // Handle percentage click
  const handlePercentageClick = (percentage) => {
    setAmount((walletBalance * percentage).toFixed(2));
    toast.info(`Amount set to ${percentage * 100}% of wallet balance`);
  };

  return (
    <div
      className="swap-page container-fluid d-flex justify-content-center align-items-center"
      style={{
        backgroundColor: "#060332",
        margin: 0,
        padding: 0,
        minHeight: "85vh",
        overflowX: "hidden",
      }}
    >
      {/* Swap Container */}
      <div className="swap-container col-md-4" style={{ padding: 0 }}>
        <div
          className="card m-3"
          style={{
            backgroundColor: "#060332",
            color: "#fff",
            minHeight: "100%",
          }}
        >
          <div className="card-body">
            <h2 className="card-title" style={{ color: "#fff" }}>
              Swap
            </h2>
            <p>
              Balance: {walletBalance.toFixed(4)} {fromCurrency}
            </p>
            <div className="swap-form">
              {/* From Currency & Amount */}
              <div
                className="currency-amount-box mb-3 d-flex align-items-center justify-content-between"
                style={{
                  backgroundColor: "#055a6d",
                  border: "1px solid #444",
                  borderRadius: "10px",
                  padding: "10px",
                  position: "relative",
                }}
              >
                <Button
                  onClick={() => setShowFromPopup(true)}
                  className="d-flex align-items-center"
                  style={{
                    backgroundColor: "#060332",
                    borderColor: "#181717",
                    color: "#fff",
                    borderRadius: "50px",
                    padding: "10px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#020f71")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#060332")
                  }
                >
                  <img
                    src={
                      currencies.find(
                        (currency) => currency.symbol === fromCurrency
                      )?.logoURI
                    }
                    alt={fromCurrency}
                    style={{ width: 24, height: 24, marginRight: 8 }}
                  />
                  <span>{fromCurrency}</span>
                </Button>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    color: "#fff",
                    textAlign: "right",
                    width: "100%",
                    marginLeft: "10px",
                  }}
                />
              </div>

              {/* Swap Button */}
              <div className="swap-arrow text-center mb-3">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setFromCurrency(toCurrency);
                    setToCurrency(fromCurrency);
                  }}
                  style={{
                    backgroundColor: "#75CF53",
                    borderColor: "#555",
                    color: "#fff",
                    borderRadius: "50%",
                    padding: "10px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#08DF98")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#75CF53")
                  }
                >
                  ↕
                </button>
              </div>

              {/* To Currency & Converted Amount */}
              <div
                className="currency-amount-box mb-3 d-flex align-items-center justify-content-between"
                style={{
                  backgroundColor: "#055a6d",
                  border: "1px solid #444",
                  borderRadius: "10px",
                  padding: "10px",
                  position: "relative",
                }}
              >
                <Button
                  onClick={() => setShowToPopup(true)}
                  className="d-flex align-items-center"
                  style={{
                    backgroundColor: "#060332",
                    borderColor: "#181717",
                    color: "#fff",
                    borderRadius: "30px",
                    padding: "10px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#020f71")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#060332")
                  }
                >
                  <img
                    src={
                      currencies.find(
                        (currency) => currency.symbol === toCurrency
                      )?.logoURI
                    }
                    alt={toCurrency}
                    style={{ width: 24, height: 24, marginRight: 8 }}
                  />
                  <span>{toCurrency}</span>
                </Button>
                <input
                  type="text"
                  value={convertedAmount}
                  readOnly
                  placeholder="0.00"
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    color: "#fff",
                    textAlign: "right",
                    width: "100%",
                    marginLeft: "10px",
                  }}
                />
              </div>

              {/* Complete Swap Button */}
              <div className="complete-swap-button-container text-center mb-3">
                <button
                  className="complete-swap-button btn w-100"
                  onClick={handleCompleteSwap}
                  style={{
                    backgroundColor: isSwapping ? "#75CF53" : "#75CF53",
                    borderColor: "#555",
                    color: "#fff",
                    borderRadius: "10px",
                    padding: "10px",
                    fontSize: "1.2em",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSwapping)
                      e.currentTarget.style.backgroundColor = "#08DF98";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSwapping)
                      e.currentTarget.style.backgroundColor = "#75CF53";
                  }}
                  disabled={isSwapping}
                >
                  {isSwapping ? (
                    <Spinner animation="border" variant="light" size="sm" />
                  ) : (
                    "Swap"
                  )}
                </button>
              </div>

              {/* Add Token Section */}
              <div className="add-token-section mt-4">
                <h4 style={{ color: "#fff" }}>Add a Custom Token</h4>
                <Form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const mint = e.target.elements["custom-mint"].value;
                    handleAddToken(mint);
                  }}
                >
                  <Form.Group>
                    <Form.Control
                      type="text"
                      placeholder="Mint Address"
                      id="custom-mint"
                      name="custom-mint"
                      style={{
                        backgroundColor: "#055a6d",
                        borderColor: "#444",
                        color: "#fff",
                      }}
                    />
                  </Form.Group>
                  <Button
                    type="submit"
                    style={{
                      backgroundColor: "#75CF53",
                      borderColor: "#555",
                      color: "#fff",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#08DF98")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#75CF53")
                    }
                  >
                    {loading ? (
                      <Spinner animation="border" variant="light" size="sm" />
                    ) : (
                      "Add Token"
                    )}
                  </Button>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* From Currency Popup */}
      {showFromPopup && (
        <div
          className="popup-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            zIndex: 1000,
          }}
          onClick={() => setShowFromPopup(false)}
        >
          <div
            className="popup-content"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#060332",
              padding: "20px",
              borderRadius: "10px",
              width: "80%",
              maxWidth: "400px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="close-button"
              onClick={() => setShowFromPopup(false)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: "1.5em",
                cursor: "pointer",
              }}
            >
              &times;
            </button>

            <h4 style={{ color: "#fff", marginBottom: "20px" }}>
              Select a Currency
            </h4>
            <div
              className="currency-list"
              style={{
                maxHeight: "300px",
                overflowY: "auto",
              }}
            >
              {currencies.map((currency) => (
                <Button
                  key={currency.symbol}
                  onClick={() => {
                    setFromCurrency(currency.symbol);
                    setShowFromPopup(false);
                  }}
                  className="w-100 d-flex align-items-center mb-2"
                  style={{
                    backgroundColor: "#055a6d",
                    borderColor: "#444",
                    color: "#fff",
                    textAlign: "left",
                    padding: "8px",
                    borderRadius: "5px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#09aace")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#055a6d")
                  }
                >
                  {currency.logoURI && (
                    <img
                      src={currency.logoURI}
                      alt={currency.symbol}
                      style={{ width: 24, height: 24, marginRight: 8 }}
                    />
                  )}
                  <span>{currency.symbol}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* To Currency Popup */}
      {showToPopup && (
        <div
          className="popup-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            zIndex: 1000,
          }}
          onClick={() => setShowToPopup(false)}
        >
          <div
            className="popup-content"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#060332",
              padding: "20px",
              borderRadius: "10px",
              width: "80%",
              maxWidth: "400px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="close-button"
              onClick={() => setShowToPopup(false)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: "1.5em",
                cursor: "pointer",
              }}
            >
              &times;
            </button>

            <h4 style={{ color: "#fff", marginBottom: "20px" }}>
              Select a Currency
            </h4>
            <div
              className="currency-list"
              style={{
                maxHeight: "300px",
                overflowY: "auto",
              }}
            >
              {currencies.map((currency) => (
                <Button
                  key={currency.symbol}
                  onClick={() => {
                    setToCurrency(currency.symbol);
                    setShowToPopup(false);
                  }}
                  className="w-100 d-flex align-items-center mb-2"
                  style={{
                    backgroundColor: "#055a6d",
                    borderColor: "#444",
                    color: "#fff",
                    textAlign: "left",
                    padding: "8px",
                    borderRadius: "5px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#09aace")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#055a6d")
                  }
                >
                  {currency.logoURI && (
                    <img
                      src={currency.logoURI}
                      alt={currency.symbol}
                      style={{ width: 24, height: 24, marginRight: 8 }}
                    />
                  )}
                  <span>{currency.symbol}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={5000} />
      <style>{`
        body, html {
          margin: 0;
          padding: 0;
          background-color: #060332;
        }
      `}</style>
    </div>
  );
}

export default Swap;
