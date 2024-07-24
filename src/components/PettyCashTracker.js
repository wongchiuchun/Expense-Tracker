import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Petty Cash Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <strong>Current Balance: ${balance.toFixed(2)}</strong>
        </div>
        {!isInitialBalanceSet && (
          <div className="space-y-4 mb-4">
            <Input
              type="number"
              value={initialBalanceInput}
              onChange={(e) => setInitialBalanceInput(e.target.value)}
              placeholder="Enter initial balance"
              step="0.01"
            />
            <Button onClick={handleSetInitialBalance} className="w-full">Set Initial Balance</Button>
          </div>
        )}
        <div className="space-y-4 mb-4">
          <Input
            type="number"
            value={addBalanceAmount}
            onChange={(e) => setAddBalanceAmount(e.target.value)}
            placeholder="Amount to add to balance"
            step="0.01"
          />
          <Button onClick={handleAddBalance} className="w-full">Add to Balance</Button>
        </div>
        <div className="space-y-4">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="Date"
          />
          <Input
            type="text"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            placeholder="Item"
          />
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            step="0.01"
          />
          <Button onClick={handleAddTransaction} className="w-full">
            {editingId !== null ? 'Update Transaction' : 'Add Transaction'}
          </Button>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Transaction History</h3>
          <ul className="space-y-2">
            {transactions.map((t) => (
              <li key={t.id} className="flex justify-between items-center">
                <span>{t.date} - {t.item}: ${t.amount.toFixed(2)} ({t.type})</span>
                <Button onClick={() => handleEditTransaction(t)}>Edit</Button>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PettyCashTracker;