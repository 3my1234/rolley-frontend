import { useEffect, useRef } from 'react';

interface FlutterwaveCheckoutProps {
  publicKey: string;
  txRef: string;
  amount: number;
  currency: string;
  email: string;
  customerName: string;
  title: string;
  description: string;
  logo: string;
  redirectUrl: string;
  onClose: () => void;
}

declare global {
  interface Window {
    FlutterwaveCheckout: any;
  }
}

export default function FlutterwaveCheckout({
  publicKey,
  txRef,
  amount,
  currency,
  email,
  customerName,
  title,
  description,
  logo,
  redirectUrl,
  onClose,
}: FlutterwaveCheckoutProps) {
  const scriptLoaded = useRef(false);

  useEffect(() => {
    // Load Flutterwave script if not already loaded
    if (!scriptLoaded.current && !window.FlutterwaveCheckout) {
      const script = document.createElement('script');
      script.src = 'https://checkout.flutterwave.com/v3.js';
      script.async = true;
      script.onload = () => {
        scriptLoaded.current = true;
        initializeCheckout();
      };
      script.onerror = () => {
        console.error('Failed to load Flutterwave script');
        onClose();
      };
      document.body.appendChild(script);
    } else if (window.FlutterwaveCheckout) {
      initializeCheckout();
    }

    function initializeCheckout() {
      try {
        window.FlutterwaveCheckout({
          public_key: publicKey,
          tx_ref: txRef,
          amount: amount,
          currency: currency,
          payment_options: 'card,banktransfer,ussd',
          customer: {
            email: email,
            name: customerName,
          },
          customizations: {
            title: title,
            description: description,
            logo: logo,
          },
          redirect_url: redirectUrl,
          onclose: () => {
            onClose();
          },
          callback: (response: any) => {
            console.log('Flutterwave callback:', response);
            if (response.status === 'successful') {
              // Redirect to payment status page
              window.location.href = `${redirectUrl}&transaction_id=${response.transaction_id}&status=successful`;
            } else {
              window.location.href = `${redirectUrl}&status=${response.status || 'cancelled'}`;
            }
          },
        });
      } catch (error) {
        console.error('Flutterwave checkout error:', error);
        onClose();
      }
    }

    return () => {
      // Cleanup if component unmounts
    };
  }, []);

  return null; // This component doesn't render anything, it just initializes Flutterwave
}

