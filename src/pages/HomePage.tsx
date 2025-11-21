import { usePrivy } from '@privy-io/react-auth';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function HomePage() {
  const { login, authenticated } = usePrivy();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authenticated && user) {
      navigate('/dashboard');
    }
  }, [authenticated, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Welcome to Rolley
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The ultimate sports betting platform with AI-powered predictions and milestone rewards
          </p>
          
          {!authenticated ? (
            <button
              onClick={login}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
            >
              Connect Wallet & Start Betting
            </button>
          ) : (
            <div className="text-center">
              <p className="text-green-600 mb-4">✅ Wallet Connected!</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
