'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Wallet, ArrowDownToLine, ArrowUpFromLine, Copy, ExternalLink, CheckCircle, Coins } from 'lucide-react';
import { formatCurrency } from '../../../lib/utils';
import QRCode from 'react-qr-code';
import { apiClient } from '../../../lib/api';
import PaymentNotification from '../../../components/PaymentNotification';

// Type declarations for MetaMask
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] | Record<string, unknown> }) => Promise<unknown>;
      isMetaMask?: boolean;
    };
  }
}

export default function WalletPage() {
  const { getAccessToken, user: privyUser } = usePrivy();
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [usdtDepositOpen, setUsdtDepositOpen] = useState(false);
  const [usdtConfirmOpen, setUsdtConfirmOpen] = useState(false);
  const [usdDepositOpen, setUsdDepositOpen] = useState(false);
  const [depositAddress, setDepositAddress] = useState('');
  const [txHash, setTxHash] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [processingUSD, setProcessingUSD] = useState(false);
  const [processingUSDT, setProcessingUSDT] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  } | null>(null);
  const [tradingOpen, setTradingOpen] = useState(false);
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [tradeCurrency, setTradeCurrency] = useState<'USD' | 'USDT'>('USD');
  const [tradeAmount, setTradeAmount] = useState('');
  const [trading, setTrading] = useState(false);
  const [rates, setRates] = useState<{ buyRate: number; sellRate: number } | null>(null);
  const [onChainBalance, setOnChainBalance] = useState<number | null>(null);
  const [checkingBalance, setCheckingBalance] = useState(false);
  
  // ROL Token Contract Details (Polygon Mainnet)
  const ROL_CONTRACT_ADDRESS = process.env.VITE_ROL_CONTRACT_ADDRESS || '0xD5fc0F40278A2C1c5451Cbe229196290735B234B'; // Update after mainnet deployment
  const ROL_TOKEN_SYMBOL = 'ROL';
  const ROL_TOKEN_DECIMALS = 18;
  const POLYGON_MAINNET_CHAIN_ID = '0x89'; // 137 in hex - Polygon Mainnet
  const POLYGONSCAN_URL = 'https://polygonscan.com';
  
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

  // Handle payment status redirect from Flutterwave
  useEffect(() => {
    const payment = searchParams.get('payment');
    const transactionId = searchParams.get('transaction_id');
    const txRef = searchParams.get('tx_ref');
    const status = searchParams.get('status');

    if (payment === 'flutterwave' && (transactionId || txRef)) {
      // Redirect to payment status page with all parameters
      const params = new URLSearchParams();
      if (transactionId) params.set('transaction_id', transactionId);
      if (txRef) params.set('tx_ref', txRef);
      if (status) params.set('status', status);
      
      navigate(`/dashboard/wallet/payment-status?${params.toString()}`);
    }
  }, [navigate, searchParams]);

  // Fetch trading rates on mount
  useEffect(() => {
    apiClient.getTokenRates().then((data: any) => {
      setRates(data);
    }).catch(console.error);
  }, []);

  // Function to add ROL token to wallet (MetaMask, Coinbase Wallet, Brave Wallet, etc.)
  const addTokenToMetaMask = async () => {
    if (typeof window.ethereum === 'undefined') {
      setNotification({
        type: 'error',
        message: 'No Ethereum wallet detected. Please install MetaMask, Coinbase Wallet, or another compatible wallet extension.'
      });
      return;
    }

    try {
      // Request to add the token using EIP-747 (wallet_watchAsset)
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: ROL_CONTRACT_ADDRESS,
            symbol: ROL_TOKEN_SYMBOL,
            decimals: ROL_TOKEN_DECIMALS,
          },
        },
      });

      setNotification({
        type: 'success',
        message: 'ROL token added to your wallet successfully!'
      });
    } catch (error: any) {
      console.error('Error adding token to wallet:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Failed to add token. Your wallet may not support this feature.'
      });
    }
  };

  // Function to check on-chain balance (uses public RPC with fallback)
  const checkOnChainBalance = async () => {
    if (!primaryWalletAddress) {
      setNotification({
        type: 'warning',
        message: 'Please connect your wallet first'
      });
      return;
    }

    setCheckingBalance(true);
    try {
      // Method 1: Try direct RPC call using ethers-like approach (Polygon Mainnet)
      const rpcUrl = 'https://polygon-rpc.com'; // Polygon Mainnet public RPC
      
      // ERC-20 balanceOf(address) function call
      // Function selector: 0x70a08231 (first 4 bytes of keccak256('balanceOf(address)'))
      // Parameter: address padded to 32 bytes (64 hex chars, without 0x prefix)
      const functionSelector = '0x70a08231';
      // Remove 0x prefix, convert to lowercase, pad to 64 hex chars
      const addressWithoutPrefix = primaryWalletAddress.startsWith('0x') 
        ? primaryWalletAddress.slice(2).toLowerCase() 
        : primaryWalletAddress.toLowerCase();
      const addressParam = addressWithoutPrefix.padStart(64, '0');
      const callData = functionSelector + addressParam;

      try {
        const rpcResponse = await fetch(rpcUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_call',
            params: [{
              to: ROL_CONTRACT_ADDRESS,
              data: callData,
            }, 'latest'],
          }),
        });

        const rpcData = await rpcResponse.json();
        
        if (rpcData.error) {
          throw new Error(`RPC Error: ${rpcData.error.message || 'Unknown error'}`);
        }

        if (rpcData.result && rpcData.result !== '0x') {
          const balanceHex = rpcData.result;
          const balanceBigInt = BigInt(balanceHex);
          const balance = Number(balanceBigInt) / Math.pow(10, ROL_TOKEN_DECIMALS);
          setOnChainBalance(balance);
          
          setNotification({
            type: 'success',
            message: `On-chain balance: ${balance.toFixed(4)} ROL`
          });
          return;
        } else {
          // Balance is 0
          setOnChainBalance(0);
          setNotification({
            type: 'info',
            message: 'On-chain balance: 0 ROL'
          });
          return;
        }
      } catch (rpcError: any) {
        console.warn('RPC call failed, trying Polygonscan API:', rpcError);
        
        // Method 2: Fallback to Polygonscan API
        try {
          const response = await fetch(
            `https://api.polygonscan.com/api?module=account&action=tokenbalance&contractaddress=${ROL_CONTRACT_ADDRESS}&address=${primaryWalletAddress}&tag=latest`
          );
          
          const apiData = await response.json();
          
          if (apiData.status === '1' && apiData.result !== undefined) {
            const balance = parseFloat(apiData.result) / Math.pow(10, ROL_TOKEN_DECIMALS);
            setOnChainBalance(balance);
            
            setNotification({
              type: 'success',
              message: `On-chain balance: ${balance.toFixed(4)} ROL (via Polygonscan)`
            });
            return;
          } else if (apiData.status === '0' && apiData.message === 'OK') {
            setOnChainBalance(0);
            setNotification({
              type: 'info',
              message: 'On-chain balance: 0 ROL'
            });
            return;
          } else {
            throw new Error(apiData.message || `Polygonscan API error: ${apiData.status || 'NOTOK'}`);
          }
        } catch (apiError: any) {
          // If both methods fail, show helpful error
          throw new Error(`Unable to check balance. ${apiError.message || 'Please verify your wallet address or try again later.'}`);
        }
      }
    } catch (error: any) {
      console.error('Error checking on-chain balance:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Failed to check on-chain balance. Please try again later.'
      });
    } finally {
      setCheckingBalance(false);
    }
  };

  // No need for useEffect or fetch functions - using global auth context

  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Get wallet from Privy user object
  type PrivyWalletAccount = {
    type: string;
    address: string;
    chainType?: string;
    walletClientType?: string;
    connectorType?: string;
    imported?: boolean;
    delegated?: boolean;
    walletIndex?: number | null;
  };

  const linkedWalletAccounts = useMemo(() => {
    return Array.isArray((privyUser as any)?.linkedAccounts)
      ? ((privyUser as any).linkedAccounts.filter(
          (account: PrivyWalletAccount) => account?.type === 'wallet' && account?.address,
        ) as PrivyWalletAccount[])
      : [];
  }, [privyUser]);

  const displayedWallets = useMemo(() => {
    const deduped: PrivyWalletAccount[] = [];

    // Filter out Solana wallets - only keep Ethereum/Polygon wallets
    linkedWalletAccounts
      .filter((account) => {
        const chainType = account.chainType?.toLowerCase() || 'ethereum';
        return chainType !== 'solana'; // Exclude Solana wallets
      })
      .forEach((account) => {
        if (!deduped.some((existing) => existing.address === account.address)) {
          deduped.push(account);
        }
      });

    if (user?.walletAddress && !deduped.some((wallet) => wallet.address === user.walletAddress)) {
      deduped.unshift({
        type: 'wallet',
        address: user.walletAddress,
        chainType: 'ethereum',
        walletClientType: 'primary-backend',
      });
    }

    return deduped;
  }, [linkedWalletAccounts, user?.walletAddress]);

  const primaryWalletAddress = useMemo(() => {
    if (user?.walletAddress) {
      return user.walletAddress;
    }

    const evmWallet = displayedWallets.find((wallet) => wallet.chainType === 'ethereum');
    if (evmWallet?.address) {
      return evmWallet.address;
    }

    if (privyUser?.wallet?.address) {
      return privyUser.wallet.address;
    }

    return displayedWallets[0]?.address || '';
  }, [displayedWallets, privyUser?.wallet?.address, user?.walletAddress]);

  const handleUSDDeposit = () => {
    console.log('USD Deposit clicked - opening dialog');
    setUsdDepositOpen(true);
  };

  const handleUSDDepositSubmit = async () => {
    // Prevent double-clicks
    if (processingUSD) {
      return;
    }

    setProcessingUSD(true);
    try {
      console.log('USD Deposit submit');
      const token = await getAccessToken();
      if (!token) {
        alert('No authentication token found');
        setProcessingUSD(false);
        return;
      }
      
      // Refetch user data to ensure we have the latest email
      try {
        const latestUser = await apiClient.getUserProfile(token) as any;
        if (!latestUser.email) {
          alert('Email required for USD deposits. Please update your email in settings first.');
          setUsdDepositOpen(false);
          setProcessingUSD(false);
          return;
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
      
      console.log('Calling depositFunds with:', { ...depositForm, amount: Number(depositForm.amount), currency: 'USD', paymentMethod: 'flutterwave' });
      const res = await apiClient.depositFunds({ ...depositForm, amount: Number(depositForm.amount), currency: 'USD', paymentMethod: 'flutterwave' }, token) as any;
      console.log('Deposit response:', res);

      if (res.paymentUrl) {
        console.log('Redirecting to Flutterwave payment URL:', res.paymentUrl);
        // Redirect directly to Flutterwave checkout
        window.location.href = res.paymentUrl;
      } else {
        setNotification({
          type: 'error',
          message: res.message || 'Payment initialization failed'
        });
        setProcessingUSD(false);
      }
    } catch (error: any) {
      console.error('USD Deposit error:', error);
      // Show the actual error message from the backend
      const errorMessage = error.message || 'Failed to initiate deposit';
      setNotification({
        type: 'error',
        message: errorMessage
      });
      setProcessingUSD(false);
    }
  };

  const createUSDTDeposit = async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        alert('No authentication token found');
        return;
      }

      console.log('Calling depositFunds with:', {
        amount: Number(depositForm.amount),
        currency: 'USDT',
        paymentMethod: 'privy',
      });

      const res = (await apiClient.depositFunds(
        { amount: Number(depositForm.amount), currency: 'USDT', paymentMethod: 'privy' },
        token,
      )) as any;

      console.log('USDT Deposit response:', res);

      const depositAddr = res.depositAddress || primaryWalletAddress;
      if (!depositAddr) {
        alert('No wallet address available. Please connect your wallet first.');
        return;
      }

      setDepositAddress(depositAddr);
      setUsdtDepositOpen(true);

      setNotification({
        type: 'success',
        message: 'USDT deposit request created. Follow the instructions below to complete the transfer.',
      });
    } catch (error: any) {
      console.error('USDT Deposit error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to get deposit address';
      setNotification({
        type: 'error',
        message: errorMessage,
      });
    }
  };

  const handleConfirmUSDTDeposit = async () => {
    if (processingUSDT) {
      return;
    }

    setProcessingUSDT(true);
    try {
      await createUSDTDeposit();
      setUsdtConfirmOpen(false);
    } finally {
      setProcessingUSDT(false);
    }
  };

  const handleVerifyUSDT = async () => {
    if (!txHash || txHash.length < 10) {
      setNotification({
        type: 'warning',
        message: 'Please enter a valid transaction hash'
      });
      return;
    }

    setVerifying(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        setNotification({
          type: 'error',
          message: 'No authentication token found'
        });
        return;
      }
      
      const res = await apiClient.verifyCryptoDeposit({ 
        transactionHash: txHash,
        amount: Number(depositForm.amount),
        network: 'polygon',
      }, token) as any;

      setNotification({
        type: 'success',
        message: `Success! ${res.message} New Balance: $${res.newBalance} USDT`
      });
      
      setUsdtDepositOpen(false);
      setTxHash('');
      // Balance will be refreshed automatically by the auth context
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: error.response?.data?.error || error.response?.data?.details || 'Failed to verify deposit'
      });
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setNotification({
      type: 'success',
      message: 'Address copied to clipboard!'
    });
  };

  const handleWithdraw = async () => {
    try {
      const token = await getAccessToken();
      if (!token) return;
      const withdrawalDetails: any = {
        method: withdrawForm.method,
      };

      if (withdrawForm.method === 'bank') {
        withdrawalDetails.accountNumber = withdrawForm.accountNumber;
        withdrawalDetails.accountBank = withdrawForm.accountBank;
      } else if (withdrawForm.method === 'wallet') {
        // Use user's wallet address if available, otherwise use manual input
        const walletAddress = primaryWalletAddress || withdrawForm.walletAddress;
        
        if (!walletAddress) {
          alert('Please enter a wallet address or connect your wallet');
          return;
        }
        
        withdrawalDetails.walletAddress = walletAddress;
      }

      await apiClient.withdrawFunds({
        amount: parseFloat(withdrawForm.amount),
        currency: withdrawForm.currency,
        withdrawalDetails,
      }, token);

      alert('Withdrawal request submitted successfully!');
      setWithdrawOpen(false);
      // Balance will be refreshed automatically by the auth context
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to withdraw');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-2">
            Wallet
          </h1>
          <p className="text-blue-300/70">Manage your funds and transactions</p>
        </div>

        {/* Payment Method Notice */}
        <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-lg border-green-500/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💳</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Payment Method Available</h3>
                <p className="text-sm text-green-200/90 mb-2">
                  <strong>USDT on Polygon is currently the only payment method available.</strong> USD deposits via Flutterwave are temporarily unavailable while we complete business registration requirements.
                </p>
                <p className="text-xs text-green-300/70">
                  ✅ USDT deposits are processed automatically within 1-2 minutes after 3 block confirmations on Polygon.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Balances */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* ROL Token Card */}
          <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-lg border-yellow-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Coins className="h-5 w-5 text-yellow-400" />
                <span>ROL Balance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-yellow-300 mb-2">
                {(user?.rolBalance || 0).toFixed(4)} ROL
              </div>
              <div className="text-sm text-yellow-300/70 mb-4">
                ≈ ${((user?.rolBalance || 0) * 100).toFixed(2)} USD
              </div>
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-xs text-yellow-200/80">
                  💡 Use ROL tokens for staking. Buy more with USD or USDT!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* USD Card */}
          <Card className="bg-white/5 backdrop-blur-lg border-white/10 opacity-60">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Wallet className="h-5 w-5" />
                <span>USD Balance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white mb-4">
                {formatCurrency(user?.usdBalance || 0)}
              </div>
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mb-4">
                <p className="text-xs text-yellow-200">
                  ⚠️ <strong>USD deposits temporarily unavailable.</strong> Please use USDT deposits to fund your account.
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  disabled
                  className="flex-1 bg-gray-600/50 text-gray-400 cursor-not-allowed"
                >
                  <ArrowDownToLine className="h-4 w-4 mr-2" />
                  Deposit (Disabled)
                </Button>
                <Button
                  disabled
                  variant="outline"
                  className="flex-1 border-gray-600/50 text-gray-400 bg-gray-600/20 cursor-not-allowed"
                >
                  <ArrowUpFromLine className="h-4 w-4 mr-2" />
                  Withdraw (Disabled)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* USDT Card */}
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-lg border-green-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Wallet className="h-5 w-5 text-green-400" />
                <span>USDT Balance</span>
                <span className="px-2 py-0.5 text-xs bg-green-600 text-white rounded">Only Payment Method</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white mb-4">
                {formatCurrency(user?.usdtBalance || 0, 'USDT')}
              </div>
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg mb-4">
                <p className="text-xs text-green-200">
                  ✅ <strong>USDT deposits are available.</strong> Send USDT on Polygon to fund your account instantly.
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setUsdtConfirmOpen(true)}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
                >
                  <ArrowDownToLine className="h-4 w-4 mr-2" />
                  Deposit
                </Button>
                <Dialog open={withdrawOpen && withdrawForm.currency === 'USDT'} onOpenChange={setWithdrawOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => setWithdrawForm({ ...withdrawForm, currency: 'USDT', method: 'wallet' })}
                      className="flex-1 border-white/20 text-white bg-white/5 hover:bg-white/10"
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

        {/* Trading Interface */}
        <Card className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 backdrop-blur-lg border-emerald-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Coins className="h-5 w-5 text-emerald-400" />
              <span>Trade ROL Tokens</span>
            </CardTitle>
            <CardDescription className="text-emerald-300/70">
              Buy or sell ROL tokens at fixed rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <p className="text-sm text-emerald-300/70 mb-1">Buy Rate</p>
                <p className="text-2xl font-bold text-emerald-300">
                  ${rates?.buyRate || 100} = 1 ROL
                </p>
              </div>
              <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <p className="text-sm text-orange-300/70 mb-1">Sell Rate</p>
                <p className="text-2xl font-bold text-orange-300">
                  1 ROL = ${rates?.sellRate || 95}
                </p>
                <p className="text-xs text-orange-300/50 mt-1">5% discount</p>
              </div>
            </div>

            <Dialog open={tradingOpen} onOpenChange={setTradingOpen}>
              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    setTradeType('BUY');
                    setTradingOpen(true);
                  }}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700"
                >
                  <ArrowDownToLine className="h-4 w-4 mr-2" />
                  Buy ROL
                </Button>
                <Button
                  onClick={() => {
                    setTradeType('SELL');
                    setTradingOpen(true);
                  }}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700"
                >
                  <ArrowUpFromLine className="h-4 w-4 mr-2" />
                  Sell ROL
                </Button>
              </div>

              <DialogContent className="bg-zinc-900 border-zinc-800">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-white">
                    {tradeType === 'BUY' ? 'Buy ROL Tokens' : 'Sell ROL Tokens'}
                  </DialogTitle>
                  <DialogDescription className="text-zinc-500">
                    {tradeType === 'BUY' 
                      ? `Buy ROL at $${rates?.buyRate || 100} per token`
                      : `Sell ROL at $${rates?.sellRate || 95} per token (5% discount)`
                    }
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label className="text-white mb-2 block">Currency</Label>
                    <Select 
                      value={tradeCurrency} 
                      onValueChange={(value: 'USD' | 'USDT') => setTradeCurrency(value)}
                    >
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="USDT">USDT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white mb-2 block">
                      {tradeType === 'BUY' ? `${tradeCurrency} Amount` : 'ROL Amount'}
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={tradeAmount}
                      onChange={(e) => setTradeAmount(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                      placeholder={tradeType === 'BUY' ? `Enter ${tradeCurrency} amount` : 'Enter ROL amount'}
                    />
                    {tradeAmount && (
                      <p className="text-xs text-zinc-400 mt-2">
                        {tradeType === 'BUY' ? (
                          <>
                            You'll receive: <span className="text-emerald-400 font-semibold">
                              {(Number(tradeAmount) / (rates?.buyRate || 100)).toFixed(4)} ROL
                            </span>
                            <br />
                            Available: {formatCurrency(tradeCurrency === 'USD' ? (user?.usdBalance || 0) : (user?.usdtBalance || 0))} {tradeCurrency}
                          </>
                        ) : (
                          <>
                            You'll receive: <span className="text-orange-400 font-semibold">
                              {formatCurrency(Number(tradeAmount) * (rates?.sellRate || 95))} {tradeCurrency}
                            </span>
                            <br />
                            Available: {(user?.rolBalance || 0).toFixed(4)} ROL
                          </>
                        )}
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={async () => {
                      if (!tradeAmount || Number(tradeAmount) <= 0) {
                        setNotification({
                          type: 'warning',
                          message: 'Please enter a valid amount'
                        });
                        return;
                      }

                      setTrading(true);
                      try {
                        const token = await getAccessToken();
                        if (!token) {
                          setNotification({
                            type: 'error',
                            message: 'No authentication token found'
                          });
                          return;
                        }

                        const result = await apiClient.tradeRol({
                          type: tradeType,
                          currency: tradeCurrency,
                          amount: Number(tradeAmount),
                        }, token) as any;

                        setNotification({
                          type: 'success',
                          message: result.message || `Trade successful!`
                        });
                        setTradingOpen(false);
                        setTradeAmount('');
                        // Balance will refresh automatically via auth context
                      } catch (error: any) {
                        setNotification({
                          type: 'error',
                          message: error.response?.data?.message || error.message || 'Trade failed'
                        });
                      } finally {
                        setTrading(false);
                      }
                    }}
                    disabled={trading || !tradeAmount || Number(tradeAmount) <= 0}
                    className={`w-full ${
                      tradeType === 'BUY'
                        ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700'
                        : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700'
                    } text-white`}
                  >
                    {trading ? 'Processing...' : `${tradeType === 'BUY' ? 'Buy' : 'Sell'} ROL`}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Polygon Wallet Connection */}
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-lg border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Wallet className="h-5 w-5 text-purple-400" />
              <span>View ROL Tokens in Wallet</span>
            </CardTitle>
            <CardDescription className="text-purple-300/70">
              Connect your Polygon wallet (MetaMask, Coinbase Wallet, etc.) to view and manage ROL tokens on-chain
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Contract Info */}
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-purple-300 text-sm font-semibold">Contract Address</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyAddress(ROL_CONTRACT_ADDRESS)}
                  className="text-purple-300 hover:text-white h-6 px-2"
                >
                  {copiedAddress === ROL_CONTRACT_ADDRESS ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <code className="text-xs text-purple-200 break-all block bg-purple-900/20 px-3 py-2 rounded">
                {ROL_CONTRACT_ADDRESS}
              </code>
              <div className="mt-3 flex items-center gap-2 text-xs text-purple-300/70">
                <span>Network: Polygon Mainnet</span>
                <span>•</span>
                <span>Symbol: {ROL_TOKEN_SYMBOL}</span>
                <span>•</span>
                <span>Decimals: {ROL_TOKEN_DECIMALS}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="grid md:grid-cols-2 gap-3">
              <Button
                onClick={addTokenToMetaMask}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Add ROL to Wallet
              </Button>
              <Button
                onClick={checkOnChainBalance}
                disabled={checkingBalance || !primaryWalletAddress}
                variant="outline"
                className="w-full border-purple-500/50 text-purple-300 bg-purple-500/10 hover:bg-purple-500/20"
              >
                {checkingBalance ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span> Checking...
                  </>
                ) : (
                  <>
                    <Coins className="h-4 w-4 mr-2" />
                    Check On-Chain Balance
                  </>
                )}
              </Button>
            </div>

            {/* On-Chain Balance Display */}
            {onChainBalance !== null && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-300/70 mb-1">On-Chain Balance</p>
                    <p className="text-2xl font-bold text-emerald-300">
                      {onChainBalance.toFixed(4)} ROL
                    </p>
                    <p className="text-xs text-emerald-300/50 mt-1">
                      ≈ ${(onChainBalance * 100).toFixed(2)} USD
                    </p>
                  </div>
                  <Coins className="h-8 w-8 text-emerald-400" />
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-200 font-semibold mb-2">📋 How to View ROL in Your Wallet:</p>
              <ol className="text-xs text-blue-300/80 space-y-1 list-decimal list-inside">
                <li>Make sure you have a compatible wallet installed (MetaMask, Coinbase Wallet, Brave Wallet, etc.)</li>
                <li>Switch to Polygon Mainnet (or add it if not available)</li>
                <li>Click "Add ROL to Wallet" button above</li>
                <li>Confirm the token addition in your wallet</li>
                <li>Your ROL balance will appear in your wallet!</li>
              </ol>
            </div>

            {/* Links */}
            <div className="flex items-center gap-4 text-sm">
              <a
                href={`${POLYGONSCAN_URL}/address/${ROL_CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                View on Polygonscan <ExternalLink className="h-3 w-3" />
              </a>
              {primaryWalletAddress && (
                <a
                  href={`${POLYGONSCAN_URL}/address/${primaryWalletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  View Your Wallet <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            {/* Note */}
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-xs text-yellow-200/80">
                💡 <strong>Note:</strong> ROL tokens are minted on-chain when you buy them. 
                Your platform balance and on-chain balance should match after purchases.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Addresses */}
        <Card className="bg-white/5 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Wallet className="h-5 w-5" />
              <span>Your Privy Wallets</span>
            </CardTitle>
            <CardDescription className="text-blue-300/70">
              Wallets provisioned when you log in with Privy. You can link external wallets during authentication.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {displayedWallets.length > 0 ? (
              displayedWallets.map((wallet) => {
                const chainType = wallet.chainType?.toLowerCase() || 'ethereum';
                // Note: Solana wallets are now filtered out in displayedWallets, but keeping check for safety
                const isSolana = chainType === 'solana';
                const isPrimary = !!primaryWalletAddress && wallet.address === primaryWalletAddress;

                const badgeLabel = (() => {
                  if (wallet.walletClientType === 'privy' || wallet.walletClientType === 'privy-v2') {
                    return 'Privy Embedded Wallet';
                  }
                  if (wallet.walletClientType === 'primary-backend') {
                    return 'Primary Wallet';
                  }
                  return 'Linked Wallet';
                })();
                const containerStyles = isPrimary
                  ? 'bg-green-900/20 border border-green-600/50'
                  : 'bg-blue-900/10 border border-blue-500/30';
                const badgeStyles = isPrimary ? 'bg-green-600' : 'bg-blue-600';
                const networkDescription = isSolana
                  ? 'Network: Solana (SPL) • Use for SOL or USDC transfers'
                  : 'Network: Ethereum (ERC-20) • Use for USDT deposits & withdrawals';

                return (
                  <div key={`${wallet.address}-${chainType}`} className={`p-4 rounded-lg ${containerStyles}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className={`h-5 w-5 ${isPrimary ? 'text-green-400' : 'text-blue-300'}`} />
                          <span className="text-sm font-semibold text-white">
                            {isSolana ? 'Solana Wallet' : 'Ethereum Wallet'}
                          </span>
                          <span className={`px-2 py-0.5 text-white text-xs rounded ${badgeStyles}`}>
                            {isPrimary ? `${badgeLabel} • Primary` : badgeLabel}
                          </span>
                        </div>
                        <code className="text-xs text-white break-all block bg-slate-800 px-2 py-1 rounded mb-3">
                          {wallet.address}
                        </code>
                        <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <CheckCircle className={`h-3 w-3 ${isPrimary ? 'text-green-400' : 'text-blue-300'}`} />
                          <span className={`${isPrimary ? 'text-green-300 font-medium' : 'text-blue-200'}`}>
                            {isSolana ? 'SOL/USDC transfers supported manually' : 'USDT deposits supported'}
                          </span>
                        </div>
                        {!isSolana && (
                          <div className="flex items-center gap-2 text-xs">
                            <CheckCircle className={`h-3 w-3 ${isPrimary ? 'text-green-400' : 'text-blue-300'}`} />
                            <span className={`${isPrimary ? 'text-green-300 font-medium' : 'text-blue-200'}`}>
                              Withdrawals routed via Rolley support
                            </span>
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-2">{networkDescription}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyAddress(wallet.address)}
                        className="text-blue-300 hover:text-white hover:bg-white/10"
                      >
                        {copiedAddress === wallet.address ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-200">
                  ⚠️ <strong>No wallet connected.</strong> Please connect your wallet during login to enable USDT deposits and withdrawals.
                </p>
              </div>
            )}

            {/* Connect Wallet Info */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-200">
                💡 <strong>Note:</strong> Use the wallet address above for all USDT transactions. 
                You can connect external wallets like MetaMask during login.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* USDT Deposit Dialog */}
        <Dialog open={usdtConfirmOpen} onOpenChange={setUsdtConfirmOpen}>
          <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-green-500/30 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl text-white">Confirm USDT Deposit</DialogTitle>
              <DialogDescription className="text-green-300/70">
                We’ll create a pending deposit request and monitor the Polygon blockchain for your transfer.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-200 text-sm">
                  Amount: <span className="font-semibold">${depositForm.amount} USDT (Polygon)</span>
                </p>
                <p className="text-green-200/80 text-sm mt-2">
                  After confirming, you’ll see instructions with the wallet address to send funds to.
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={handleConfirmUSDTDeposit}
                  disabled={processingUSDT}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingUSDT ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Creating deposit request...
                    </>
                  ) : (
                    'Yes, I’m ready to deposit'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setUsdtConfirmOpen(false)}
                  className="w-full border-white/20 text-white bg-white/5 hover:bg-white/10"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={usdtDepositOpen} onOpenChange={setUsdtDepositOpen}>
          <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-blue-500/30 sm:max-w-2xl max-h-[calc(100vh-6rem)] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-white">Deposit USDT</DialogTitle>
              <DialogDescription className="text-blue-300/70">
                Send USDT to your wallet address below
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Amount Selection */}
              <div>
                <Label className="text-white mb-3 block">Select Amount:</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[0.15, 1, 10, 100, 1000, 10000].map((amount) => (
                    <Button
                      key={amount}
                      variant={Number(depositForm.amount) === amount ? "default" : "outline"}
                      onClick={() => setDepositForm({ ...depositForm, amount: amount.toString() })}
                      className={`${
                        Number(depositForm.amount) === amount
                          ? "bg-blue-600 text-white"
                          : "border-white/20 text-white bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
              </div>

              {/* QR Code */}
              {depositAddress && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="bg-white p-6 rounded-xl">
                    <QRCode value={depositAddress} size={200} />
                  </div>
                  
                  {/* Address */}
                  <div className="w-full">
                    <Label className="text-white mb-2 block">Your Wallet Address:</Label>
                    <div className="flex items-center space-x-2 bg-slate-800/50 p-3 rounded-lg">
                      <code className="text-sm text-blue-300 flex-1 break-all">{depositAddress}</code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(depositAddress)}
                        className="border-white/20"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 w-full mb-4">
                    <h4 className="text-white font-semibold mb-2">✅ Automatic Detection Enabled</h4>
                    <p className="text-green-200/80 text-sm mb-3">
                      Your deposit will be automatically detected on-chain within 1-2 minutes after 3 block confirmations. No manual verification needed!
                    </p>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 w-full">
                    <h4 className="text-white font-semibold mb-2">📝 Instructions:</h4>
                    <ol className="text-blue-200/80 text-sm space-y-2">
                      <li>1. Send exactly <span className="font-bold">${depositForm.amount} USDT (Polygon)</span> to the address above</li>
                      <li>2. Use the <span className="font-bold">Polygon PoS network</span> (do not use Ethereum, Tron, or BSC)</li>
                      <li>3. Keep at least <span className="font-bold">0.05 MATIC</span> in your wallet to cover gas fees</li>
                      <li>4. Wait 1-2 minutes — your balance will update automatically after 3 confirmations</li>
                      <li>5. (Optional) If not detected after 10 minutes, use manual verification below</li>
                    </ol>
                  </div>

                  {/* Transaction Hash Input (Manual Verification - Fallback) */}
                  <div className="w-full space-y-3 mt-4">
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-3">
                      <p className="text-yellow-200 text-xs">
                        💡 <strong>Manual Verification (Fallback):</strong> Only use this if automatic detection doesn't work after 10 minutes on Polygon.
                      </p>
                    </div>
                    <div>
                      <Label className="text-white mb-2 block">Transaction Hash (Optional):</Label>
                      <Input
                        placeholder="0x1234..."
                        value={txHash}
                        onChange={(e) => setTxHash(e.target.value)}
                        className="bg-slate-800/50 border-blue-500/30 text-white"
                      />
                        <p className="text-xs text-blue-300/50 mt-1">
                        Get this from MetaMask or your wallet after sending on Polygon PoS
                      </p>
                    </div>

                    <Button
                      onClick={handleVerifyUSDT}
                      disabled={!txHash || verifying}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
                    >
                      {verifying ? (
                        <><span className="animate-spin mr-2">⏳</span> Verifying on Blockchain...</>
                      ) : (
                        <><CheckCircle className="mr-2 h-4 w-4" /> Verify Deposit</>
                      )}
                    </Button>
                  </div>

                  {/* Help Links */}
                  <div className="flex space-x-4 text-sm">
                    <a
                      href={`https://polygonscan.com/address/${depositAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 flex items-center"
                    >
                      View on Etherscan <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                    <a
                      href="https://support.rolley.com/usdt-deposits"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 flex items-center"
                    >
                      Need Help? <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Withdraw Dialog */}
        <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
          <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-blue-500/30 sm:max-w-xl max-h-[calc(100vh-6rem)] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-white">Withdraw {withdrawForm.currency}</DialogTitle>
              <DialogDescription className="text-blue-300/70">
                Withdraw funds from your wallet (fees apply)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-white">Amount</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={withdrawForm.amount}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                  className="bg-slate-800/50 border-blue-500/30 text-white"
                />
              </div>
              
              {withdrawForm.currency === 'USD' && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm text-yellow-200">
                    ⚠️ <strong>USD withdrawals are temporarily unavailable.</strong> Please use USDT withdrawals instead.
                  </p>
                </div>
              )}
              
              {withdrawForm.currency === 'USDT' && (
                <div>
                  <Label className="text-white mb-2 block">Withdrawal Wallet Address</Label>
                  {user?.walletAddress ? (
                    <div className="space-y-3">
                      <div className="p-4 bg-green-900/20 border border-green-600/50 rounded-lg">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-green-400 mb-2">
                              ✅ Your Connected Wallet
                            </p>
                            <code className="text-xs text-white break-all bg-slate-800 px-2 py-1 rounded">
                              {user.walletAddress}
                            </code>
                            <p className="text-xs text-gray-400 mt-2">
                              USDT will be sent to this address (your connected MetaMask wallet)
                            </p>
                          </div>
                        </div>
                      </div>
                      <details className="text-xs">
                        <summary className="text-blue-400 cursor-pointer hover:text-blue-300">
                          Want to use a different address?
                        </summary>
                        <div className="mt-2 p-3 bg-slate-800 rounded-lg">
                          <Input
                            placeholder="Enter different USDT wallet address"
                            value={withdrawForm.walletAddress}
                            onChange={(e) => setWithdrawForm({ ...withdrawForm, walletAddress: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                          <p className="text-yellow-400 text-xs mt-2">
                            ⚠️ Make sure you own this wallet address!
                          </p>
                        </div>
                      </details>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 bg-red-900/20 border border-red-600/50 rounded-lg mb-3">
                        <p className="text-red-400 text-sm">
                          ⚠️ No wallet connected. Please connect your wallet first or enter address manually.
                        </p>
                      </div>
                      <Input
                        placeholder="Enter your USDT wallet address (ERC-20)"
                        value={withdrawForm.walletAddress}
                        onChange={(e) => setWithdrawForm({ ...withdrawForm, walletAddress: e.target.value })}
                        className="bg-slate-800/50 border-blue-500/30 text-white"
                      />
                      <p className="text-xs text-yellow-300/70 mt-2">
                        💡 Connect your wallet in Settings to auto-fill this field
                      </p>
                    </>
                  )}
                  <div className="mt-3 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                    <p className="text-xs text-blue-300">
                      <strong>Important:</strong> Withdrawals are sent on the Polygon PoS network. 
                      Make sure the destination wallet supports Polygon USDT and holds a little MATIC for gas.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-sm text-yellow-200">
                  <strong>Note:</strong> Withdrawal fees apply. 10% on profits or 5% on early withdrawal.
                </p>
              </div>
              
              <Button onClick={handleWithdraw} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700">
                Submit Withdrawal Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* USD Deposit Dialog - DISABLED */}
        {/* Removed: USD deposits via Flutterwave are temporarily unavailable */}

        {/* Payment Notification */}
        {notification && (
          <PaymentNotification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}
      </div>
    </div>
  );
}
