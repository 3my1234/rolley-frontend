import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { AlertTriangle } from 'lucide-react';

interface TermsAcceptanceModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function TermsAcceptanceModal({ isOpen, onAccept, onDecline }: TermsAcceptanceModalProps) {
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [hasReadPrivacy, setHasReadPrivacy] = useState(false);
  const [acceptsRisks, setAcceptsRisks] = useState(false);
  const [acceptsLosses, setAcceptsLosses] = useState(false);
  const [acceptsVoluntary, setAcceptsVoluntary] = useState(false);
  const [acceptsFees, setAcceptsFees] = useState(false);

  const allAccepted =
    hasReadTerms &&
    hasReadPrivacy &&
    acceptsRisks &&
    acceptsLosses &&
    acceptsVoluntary &&
    acceptsFees;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onDecline()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <div className="flex items-center space-x-2 text-red-600 mb-2">
            <AlertTriangle className="h-6 w-6" />
            <DialogTitle className="text-2xl">Important - Please Read Carefully</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            You must read and agree to the Terms of Service and acknowledge all risks before using Rolley.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Critical Warning */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <h3 className="font-bold text-red-900 text-lg mb-2">⚠️ CRITICAL WARNING</h3>
            <ul className="space-y-2 text-red-800 text-sm">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>YOU CAN LOSE ALL YOUR MONEY.</strong> There is a real risk of total loss of all funds you stake on this platform.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>AI CAN FAIL.</strong> Our AI aims for safe selections, but predictions can and do fail. Past performance does not guarantee future results.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>USE AT YOUR OWN RISK.</strong> You use Rolley entirely at your own risk. We are not liable for any losses.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>YOU HAVE THE RIGHT NOT TO USE THIS.</strong> Use of this platform is completely voluntary. If you don't accept these risks, do not proceed.</span>
              </li>
            </ul>
          </div>

          {/* How It Works */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-blue-900 mb-2">How Rolley Works</h3>
            <ul className="space-y-2 text-blue-800 text-sm">
              <li>1. You voluntarily stake your own funds (USD or USDT)</li>
              <li>2. Our AI scouts sporting events daily and presents opportunities</li>
              <li>3. <strong>YOU CHOOSE</strong> whether to participate in each day's opportunity or skip it</li>
              <li>4. If you participate and win, your stake rolls over (multiplies by ~1.05x)</li>
              <li>5. <strong>If you lose, you lose that amount - this is your risk</strong></li>
              <li>6. At any time you can withdraw (fees apply)</li>
            </ul>
          </div>

          {/* Fees */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-bold text-yellow-900 mb-2">💰 Fees</h3>
            <ul className="space-y-2 text-yellow-800 text-sm">
              <li>• <strong>10% of profit</strong> when you complete a stake and withdraw</li>
              <li>• <strong>5% of total amount</strong> if you withdraw without completing any stake</li>
              <li>• <strong>Fees apply regardless</strong> of participation frequency</li>
              <li>• <strong>No deposit fees</strong> - funding is free</li>
            </ul>
          </div>

          {/* Your Rights */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-bold text-green-900 mb-2">✅ Your Rights & Control</h3>
            <ul className="space-y-2 text-green-800 text-sm">
              <li>• <strong>Right to Not Use:</strong> You have the absolute right to not use this platform</li>
              <li>• <strong>Daily Choice:</strong> You decide each day whether to participate or skip</li>
              <li>• <strong>No Obligation:</strong> You are never forced to participate</li>
              <li>• <strong>Stop Anytime:</strong> You can stop using the platform at any time</li>
            </ul>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="terms"
                checked={hasReadTerms}
                onChange={(e) => setHasReadTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm font-medium cursor-pointer select-none">
                I have read and agree to the{' '}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:no-underline"
                >
                  Terms of Service
                </a>
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="privacy"
                checked={hasReadPrivacy}
                onChange={(e) => setHasReadPrivacy(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="privacy" className="text-sm font-medium cursor-pointer select-none">
                I have read and agree to the{' '}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:no-underline"
                >
                  Privacy Policy
                </a>
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="risks"
                checked={acceptsRisks}
                onChange={(e) => setAcceptsRisks(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="risks" className="text-sm font-medium cursor-pointer select-none">
                <strong>I understand and accept that I use Rolley entirely at my own risk</strong>
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="losses"
                checked={acceptsLosses}
                onChange={(e) => setAcceptsLosses(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="losses" className="text-sm font-medium cursor-pointer select-none">
                <strong>I understand I can lose ALL funds I stake, even with successful rollovers</strong>
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="voluntary"
                checked={acceptsVoluntary}
                onChange={(e) => setAcceptsVoluntary(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="voluntary" className="text-sm font-medium cursor-pointer select-none">
                <strong>I acknowledge my use is voluntary and I have the right not to use this platform</strong>
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="fees"
                checked={acceptsFees}
                onChange={(e) => setAcceptsFees(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="fees" className="text-sm font-medium cursor-pointer select-none">
                I understand and accept the fee structure (10% on profits, 5% on withdrawals without stakes)
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onDecline}
              className="flex-1"
              type="button"
            >
              I Do Not Agree (Exit)
            </Button>
            <Button
              onClick={onAccept}
              disabled={!allAccepted}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              {allAccepted ? 'I Agree - Proceed to Platform' : 'Complete All Checkboxes Above'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
