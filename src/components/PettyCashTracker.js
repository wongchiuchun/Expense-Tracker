import React, { useState, useEffect } from 'react';

const API_URL = '/.netlify/functions/api';

const PettyCashTracker = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [date, setDate] = useState('');
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [initialBalanceInput, setInitialBalanceInput] = useState('');
  const [isInitialBalanceSet, setIsInitialBalanceSet] = useState(false);
  const [addBalanceAmount, setAddBalanceAmount] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchTransactions();
    fetchBalance();
  }, []);

  const fetchTransactions = async () => {
    const response = await fetch(`${API_URL}/transactions`);
    const data = await response.json();
    setTransactions(data);
    setIsInitialBalanceSet(data.length > 0);
  };

  const fetchBalance = async () => {
    const response = await fetch(`${API_URL}/balance`);
    const data = await response.json();
    setBalance(data.balance);
  };

  const handleAddTransaction = async () => {
    if (!date || !item || !amount) return;

    const newTransaction = {
      date,
      item,
      amount: parseFloat(amount),
      type: 'expense'
    };

    if (editingId !== null) {
      await fetch(`${API_URL}/transactions/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify(newTransaction)
      });
    } else {
      await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        body: JSON.stringify(newTransaction)
      });
    }

    await fetchTransactions();
    await updateBalance(balance - newTransaction.amount);
    
    setDate('');
    setItem('');
    setAmount('');
    setEditingId(null);
  };

  const handleSetInitialBalance = async () => {
    const initialBalance = parseFloat(initialBalanceInput);
    if (!isNaN(initialBalance) && !isInitialBalanceSet) {
      await updateBalance(initialBalance);
      await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          item: 'Initial Balance',
          amount: initialBalance,
          type: 'income'
        })
      });
      await fetchTransactions();
      setInitialBalanceInput('');
    }
  };

  const handleAddBalance = async () => {
    const amountToAdd = parseFloat(addBalanceAmount);
    if (!isNaN(amountToAdd)) {
      await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          item: 'Balance Added',
          amount: amountToAdd,
          type: 'income'
        })
      });
      await fetchTransactions();
      await updateBalance(balance + amountToAdd);
      setAddBalanceAmount('');
    }
  };

  const updateBalance = async (newBalance) => {
    await fetch(`${API_URL}/balance`, {
      method: 'PUT',
      body: JSON.stringify({ balance: newBalance })
    });
    setBalance(newBalance);
  };

  const handleEditTransaction = (transaction) => {
    setDate(transaction.date);
    setItem(transaction.item);
    setAmount(transaction.amount.toString());
    setEditingId(transaction.id);
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Petty Cash Tracker</h1>
      <div className="mb-4">
        <strong>Current Balance: ${balance.toFixed(2)}</strong>
      </div>
      {!isInitialBalanceSet && (
        <div className="mb-4">
          <input
            type="number"
            value={initialBalanceInput}
            onChange={(e) => setInitialBalanceInput(e.target.value)}
            placeholder="Enter initial balance"
            step="0.01"
            className="w-full p-2 border rounded"
          />
          <button onClick={handleSetInitialBalance} className="w-full mt-2 p-2 bg-blue-500 text-white rounded">Set Initial Balance</button>
        </div>
      )}
      <div className="mb-4">
        <input
          type="number"
          value={addBalanceAmount}
          onChange={(e) => setAddBalanceAmount(e.target.value)}
          placeholder="Amount to add to balance"
          step="0.01"
          className="w-full p-2 border rounded"
        />
        <button onClick={handleAddBalance} className="w-full mt-2 p-2 bg-green-500 text-white rounded">Add to Balance</button>
      </div>
      <div className="mb-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="text"
          value={item}
          onChange={(e) => setItem(e.target.value)}
          placeholder="Item"
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          step="0.01"
          className="w-full p-2 border rounded mb-2"
        />
        <button onClick={handleAddTransaction} className="w-full p-2 bg-blue-500 text-white rounded">
          {editingId !== null ? 'Update Transaction' : 'Add Transaction'}
        </button>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Transaction History</h2>
        <ul>
          {transactions.map((t) => (
            <li key={t.id} className="flex justify-between items-center mb-2">
              <span>{t.date} - {t.item}: ${t.amount.toFixed(2)} ({t.type})</span>
              <button onClick={() => handleEditTransaction(t)} className="p-1 bg-yellow-500 text-white rounded">Edit</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PettyCashTracker;