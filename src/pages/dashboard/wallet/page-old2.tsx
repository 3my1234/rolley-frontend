'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Wallet, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import axios from 'axios';
import { formatCurrency } from '../../lib/utils';
import QRCode from 'react-qr-code';

export default function WalletPage() {
  const { getAccessToken } = usePrivy();
  const [user, setUser] = useState<any>(null);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [depositForm, setDepositForm] = useState({
    amount: '10',
    currency: 'USD',
    paymentMethod: 'flutterwave',
  });

  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    currency: 'USD',
    method: 'bank',
    accountNumber: '',
    accountBank: '',
    walletAddress: '',
  });

  const [depositAddress, setDepositAddress] = useState('');

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = await getAccessToken();
      const res = await axios.get('/api/auth/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    try {
      const token = await getAccessToken();
      const res = await axios.post(
        '/api/wallet/deposit',
        depositForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      } else if (res.data.depositAddress) {
        setDepositAddress(res.data.depositAddress);
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to initiate deposit');
    }
  };

  const handleWithdraw = async () => {
    try {
      const token = await getAccessToken();
      const withdrawalDetails: any = {
        method: withdrawForm.method,
      };

      if (withdrawForm.method === 'bank') {
        withdrawalDetails.accountNumber = withdrawForm.accountNumber;
        withdrawalDetails.accountBank = withdrawForm.accountBank;
      } else if (withdrawForm.method === 'wallet') {
        withdrawalDetails.walletAddress = withdrawForm.walletAddress;
      }

      await axios.post(
        '/api/wallet/withdraw',
        {
          amount: parseFloat(withdrawForm.amount),
          currency: withdrawForm.currency,
          withdrawalDetails,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Withdrawal request submitted successfully!');
      setWithdrawOpen(false);
      fetchUser();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to withdraw');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
        <p className="text-gray-600">Manage your funds and transactions</p>
      </div>

      {/* Balances */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="h-5 w-5" />
              <span>USD Balance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-4">
              {formatCurrency(user?.usdBalance || 0)}
            </div>
            <div className="flex space-x-2">
              <Dialog open={depositOpen && depositForm.currency === 'USD'} onOpenChange={setDepositOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => setDepositForm({ ...depositForm, currency: 'USD', paymentMethod: 'flutterwave' })}
                    className="flex-1"
                  >
                    <ArrowDownToLine className="h-4 w-4 mr-2" />
                    Deposit
                  </Button>
                </DialogTrigger>
              </Dialog>
              <Dialog open={withdrawOpen && withdrawForm.currency === 'USD'} onOpenChange={setWithdrawOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => setWithdrawForm({ ...withdrawForm, currency: 'USD' })}
                    className="flex-1"
                  >
                    <ArrowUpFromLine className="h-4 w-4 mr-2" />
                    Withdraw
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="h-5 w-5" />
              <span>USDT Balance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-4">
              {formatCurrency(user?.usdtBalance || 0, 'USDT')}
            </div>
            <div className="flex space-x-2">
              <Dialog open={depositOpen && depositForm.currency === 'USDT'} onOpenChange={setDepositOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => setDepositForm({ ...depositForm, currency: 'USDT', paymentMethod: 'privy' })}
                    className="flex-1"
                  >
                    <ArrowDownToLine className="h-4 w-4 mr-2" />
                    Deposit
                  </Button>
                </DialogTrigger>
              </Dialog>
              <Dialog open={withdrawOpen && withdrawForm.currency === 'USDT'} onOpenChange={setWithdrawOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => setWithdrawForm({ ...withdrawForm, currency: 'USDT', method: 'wallet' })}
                    className="flex-1"
                  >
                    <ArrowUpFromLine className="h-4 w-4 mr-2" />
                    Withdraw
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deposit Dialog */}
      <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deposit {depositForm.currency}</DialogTitle>
            <DialogDescription>
              Add funds to your wallet
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!depositAddress ? (
              <>
                <div>
                  <Label>Amount</Label>
                  <Select value={depositForm.amount} onValueChange={(v) => setDepositForm({ ...depositForm, amount: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[10, 100, 1000, 10000, 100000, 1000000].map((amt) => (
                        <SelectItem key={amt} value={amt.toString()}>
                          {formatCurrency(amt)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleDeposit} className="w-full">
                  Continue to Payment
                </Button>
              </>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Send USDT to this address:
                </p>
                <div className="bg-white p-4 rounded-lg inline-block">
                  <QRCode value={depositAddress} size={200} />
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <code className="text-sm break-all">{depositAddress}</code>
                </div>
                <p className="text-xs text-gray-500">
                  After sending, your balance will update automatically
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw {withdrawForm.currency}</DialogTitle>
            <DialogDescription>
              Withdraw funds from your wallet (fees apply)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={withdrawForm.amount}
                onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
              />
            </div>
            
            {withdrawForm.currency === 'USD' && (
              <>
                <div>
                  <Label>Withdrawal Method</Label>
                  <Select value={withdrawForm.method} onValueChange={(v) => setWithdrawForm({ ...withdrawForm, method: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">Bank Account</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {withdrawForm.method === 'bank' && (
                  <>
                    <div>
                      <Label>Bank Code</Label>
                      <Input
                        placeholder="e.g., 058"
                        value={withdrawForm.accountBank}
                        onChange={(e) => setWithdrawForm({ ...withdrawForm, accountBank: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Account Number</Label>
                      <Input
                        placeholder="Enter account number"
                        value={withdrawForm.accountNumber}
                        onChange={(e) => setWithdrawForm({ ...withdrawForm, accountNumber: e.target.value })}
                      />
                    </div>
                  </>
                )}
              </>
            )}
            
            {withdrawForm.currency === 'USDT' && (
              <div>
                <Label>Wallet Address</Label>
                <Input
                  placeholder="Enter USDT wallet address"
                  value={withdrawForm.walletAddress}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, walletAddress: e.target.value })}
                />
              </div>
            )}
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Withdrawal fees apply. Check fee structure in settings.
              </p>
            </div>
            
            <Button onClick={handleWithdraw} className="w-full">
              Submit Withdrawal Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


