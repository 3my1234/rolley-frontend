'use client';

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { apiClient } from '../../../../lib/api';

export default function PaymentStatusPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'cancelled'>('loading');
  const [message, setMessage] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [amount, setAmount] = useState(0);
  const [rolAmount, setRolAmount] = useState<number | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const transactionId = searchParams.get('transaction_id');
      const txRef = searchParams.get('tx_ref');
      const statusParam = searchParams.get('status');

      console.log('Payment status params:', { transactionId, txRef, statusParam });

      // Handle cancelled payments (they don't have transaction_id)
      if (statusParam === 'cancelled') {
        setStatus('cancelled');
        setMessage('You cancelled the payment. No charges were made.');
        if (txRef) {
          setTransactionId(txRef);
        }
        return;
      }

      if (!txRef) {
        setStatus('failed');
        setMessage('Invalid payment parameters');
        return;
      }

      try {
        // Call backend to verify payment (only if we have transaction_id)
        if (!transactionId) {
          setStatus('failed');
          setMessage('Payment verification failed - missing transaction ID');
          return;
        }
        
        const response = await apiClient.verifyPayment(transactionId, txRef, statusParam || '') as any;
        
        if (response.success) {
          setStatus('success');
          setMessage(response.message);
          setTransactionId(transactionId);
          setAmount(response.amount);
          setRolAmount(response.rolAmount || (response.amount / 100));
        } else {
          setStatus('failed');
          setMessage(response.message || 'Payment verification failed');
          setTransactionId(transactionId);
        }
      } catch (error: any) {
        console.error('Payment verification error:', error);
        setStatus('failed');
        setMessage(error.message || 'Failed to verify payment');
        setTransactionId(transactionId);
      }
    };

    verifyPayment();
  }, [searchParams]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'failed':
        return <XCircle className="h-16 w-16 text-red-500" />;
      case 'cancelled':
        return <AlertCircle className="h-16 w-16 text-yellow-500" />;
      default:
        return <Clock className="h-16 w-16 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'border-green-500/30 bg-green-500/10';
      case 'failed':
        return 'border-red-500/30 bg-red-500/10';
      case 'cancelled':
        return 'border-yellow-500/30 bg-yellow-500/10';
      default:
        return 'border-blue-500/30 bg-blue-500/10';
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'success':
        return 'Payment Successful!';
      case 'failed':
        return 'Payment Failed';
      case 'cancelled':
        return 'Payment Cancelled';
      default:
        return 'Verifying Payment...';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-6">
      <Card className={`w-full max-w-md bg-white/5 backdrop-blur-lg border ${getStatusColor()}`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-2xl text-white">
            {getStatusTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-300 mb-4">{message}</p>
            
            {status === 'success' && amount > 0 && (
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-4">
                <p className="text-green-300 font-semibold text-lg mb-2">
                  Payment Successful! 🎉
                </p>
                <p className="text-green-200 text-xl font-bold">
                  {rolAmount ? rolAmount.toFixed(4) : (amount / 100).toFixed(4)} ROL tokens
                </p>
                <p className="text-green-300/70 text-sm mt-1">
                  ${amount} USD has been converted to ROL tokens
                </p>
              </div>
            )}

            {transactionId && (
              <div className="bg-slate-800/50 border border-white/10 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-400 mb-1">Transaction ID:</p>
                <p className="text-sm text-blue-300 font-mono break-all">{transactionId}</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigate('/dashboard/wallet')}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
            >
              Back to Wallet
            </Button>
            
            {status === 'failed' && (
              <Button
                onClick={() => navigate('/dashboard/wallet')}
                variant="outline"
                className="w-full border-white/20 text-white bg-white/5 hover:bg-white/10"
              >
                Try Again
              </Button>
            )}
            
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="w-full border-white/20 text-white bg-white/5 hover:bg-white/10"
            >
              Go to Dashboard
            </Button>
          </div>

          {status === 'loading' && (
            <div className="text-center">
              <p className="text-sm text-gray-400">
                Please wait while we verify your payment...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


