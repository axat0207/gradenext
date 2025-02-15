'use client'
import { useEffect, useState } from "react";

const MercuryTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Using relative URL which will be proxied through our Next.js API route
        const response = await fetch("/api/mercury");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setTransactions(data);
        console.log("Mercury API Response:", data);
      } catch (error) {
        setError(error.message);
        console.error("Error details:", {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });
      }
    };

    fetchTransactions();
  }, []);

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Error Loading Transactions</h1>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Mercury Transactions</h1>
      {transactions.length > 0 ? (
        <div>
          {/* Add your transaction display logic here */}
          <p>{transactions.length} transactions loaded</p>
        </div>
      ) : (
        <p>Loading transactions...</p>
      )}
    </div>
  );
};

export default MercuryTransactions;