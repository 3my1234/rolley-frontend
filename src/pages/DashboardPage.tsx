import { usePrivy } from '@privy-io/react-auth';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { logout, authenticated } = usePrivy();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

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

  if (!authenticated || !user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card shadow-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-card-foreground">Rolley Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-muted-foreground">Welcome, {user.email || 'User'}!</span>
              <button
                onClick={logout}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Wallet Card */}
          <div className="bg-card rounded-lg shadow p-6 border border-border">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Wallet Balance</h3>
            <p className="text-3xl font-bold text-primary">$0.00</p>
            <p className="text-sm text-muted-foreground mt-2">Available Balance</p>
          </div>

          {/* Tokens Card */}
          <div className="bg-card rounded-lg shadow p-6 border border-border">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">ROL Tokens</h3>
            <p className="text-3xl font-bold text-green-600">0</p>
            <p className="text-sm text-muted-foreground mt-2">Reward Tokens</p>
          </div>

          {/* Active Stakes Card */}
          <div className="bg-card rounded-lg shadow p-6 border border-border">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Active Stakes</h3>
            <p className="text-3xl font-bold text-purple-600">0</p>
            <p className="text-sm text-muted-foreground mt-2">Current Bets</p>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-card rounded-lg shadow p-6 border border-border">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-6 rounded-lg transition-colors">
                Deposit Funds
              </button>
              <button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground py-3 px-6 rounded-lg transition-colors">
                View Today's Matches
              </button>
              <button className="bg-accent hover:bg-accent/90 text-accent-foreground py-3 px-6 rounded-lg transition-colors">
                My Milestone Cards
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
