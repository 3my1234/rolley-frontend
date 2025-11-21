'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { User, Wallet, Info } from 'lucide-react';
import { apiClient } from '../../../lib/api';

export default function SettingsPage() {
  const { privyToken } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
  });

  useEffect(() => {
    if (privyToken) {
      fetchUser();
    }
  }, [privyToken]);

  const fetchUser = async () => {
    try {
      if (!privyToken) return;
      
      const user = await apiClient.getUserProfile(privyToken) as any;
      setUser(user);
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        email: user.email || '',
      });
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      if (!privyToken) {
        alert('No authentication token found');
        return;
      }
      
      await apiClient.updateUserProfile(profileForm, privyToken);
      alert('Profile updated successfully!');
      fetchUser();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-300">Manage your account and preferences</p>
        </div>

      {/* Profile Settings */}
      <Card className="bg-white/5 backdrop-blur-lg border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <User className="h-5 w-5" />
            <span>Profile Information</span>
          </CardTitle>
          <CardDescription className="text-gray-300">
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white">First Name</Label>
              <Input
                value={profileForm.firstName}
                onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                placeholder="Enter first name"
                className="bg-slate-800/50 border-blue-500/30 text-white"
              />
            </div>
            <div>
              <Label className="text-white">Last Name</Label>
              <Input
                value={profileForm.lastName}
                onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                placeholder="Enter last name"
                className="bg-slate-800/50 border-blue-500/30 text-white"
              />
            </div>
          </div>
          <div>
            <Label className="text-white">Phone Number</Label>
            <Input
              value={profileForm.phoneNumber}
              onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
              placeholder="Enter phone number"
              className="bg-slate-800/50 border-blue-500/30 text-white"
            />
          </div>
          <div>
            <Label className="text-white">Email</Label>
            <Input
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              placeholder="Enter email address"
              className="bg-slate-800/50 border-blue-500/30 text-white"
            />
          </div>
          <Button 
            onClick={handleSaveProfile} 
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Wallet Information */}
      <Card className="bg-white/5 backdrop-blur-lg border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Wallet className="h-5 w-5" />
            <span>Privy Wallet Information</span>
          </CardTitle>
          <CardDescription className="text-gray-300">
            Wallets generated by Privy during authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white">Embedded Wallet Address</Label>
            <Input 
              value={user?.walletAddress || 'Not connected'} 
              disabled 
              className="bg-slate-800/50 border-blue-500/30 text-white"
            />
          </div>
          <div>
            <Label className="text-white">Privy ID</Label>
            <Input 
              value={user?.privyId || 'Not connected'} 
              disabled 
              className="bg-slate-800/50 border-blue-500/30 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Fee Information */}
      <Card className="bg-white/5 backdrop-blur-lg border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Info className="h-5 w-5" />
            <span>Fee Structure</span>
          </CardTitle>
          <CardDescription className="text-gray-300">
            Understand our transparent fee model
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-slate-800/50 rounded-lg border border-white/10">
              <span className="font-medium text-white">Withdrawal with completed stake</span>
              <span className="text-blue-400 font-bold">10% of profit</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-800/50 rounded-lg border border-white/10">
              <span className="font-medium text-white">Withdrawal without staking</span>
              <span className="text-blue-400 font-bold">5% of total amount</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-800/50 rounded-lg border border-white/10">
              <span className="font-medium text-white">Deposit fees</span>
              <span className="text-green-400 font-bold">FREE</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-800/50 rounded-lg border border-white/10">
              <span className="font-medium text-white">Daily target odds</span>
              <span className="text-blue-400 font-bold">1.05x</span>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-4 mt-4">
            <h4 className="font-semibold mb-2 text-white">Example Calculation</h4>
            <div className="text-sm text-gray-300 space-y-1">
              <p>Initial stake: $10</p>
              <p>After 30 days (with daily participation): ~$43.22</p>
              <p>Profit: $33.22</p>
              <p>Fee (10% of profit): $3.32</p>
              <p className="font-bold text-white">Your payout: $39.90</p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}


