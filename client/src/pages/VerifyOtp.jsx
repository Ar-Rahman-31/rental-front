// src/pages/VerifyOtp.jsx
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { toast } from 'sonner';
import { Loader2, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PageContainer } from '../components/layout/PageContainer';

export function VerifyOtp() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resendOtp } = useAuth();

  const email = searchParams.get('email');
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState('idle'); // idle | verifying | success | error
  const [seconds, setSeconds] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // countdown for resend cooldown
  useEffect(() => {
    if (seconds > 0) {
      const t = setTimeout(() => setSeconds(s => s - 1), 1000);
      return () => clearTimeout(t);
    } else setCanResend(true);
  }, [seconds]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setStatus('verifying');
    try {
      await authService.verifyOtp({ email, otp });
      toast.success('E‑mail verified! Redirecting…');
      setTimeout(() => navigate('/login'), 1500);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Invalid / expired OTP');
      setStatus('error');
    }
  };

  const handleResend = async () => {
    if (!email) return toast.error('No e‑mail in link');
    try {
      await resendOtp(email);
      toast.success('New OTP sent');
      setSeconds(60);
    } catch { toast.error('Could not resend OTP'); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <PageContainer className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Enter the 6‑digit code</h1>
          <p className="text-gray-500 mb-6">We sent a code to <strong>{email}</strong></p>

          <form onSubmit={handleVerify} className="space-y-4">
            <Input
              label="OTP"
              name="otp"
              type="text"
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
              placeholder="123456"
              required
              autoComplete="one-time-code"
              inputMode="numeric"
            />
            <Button type="submit" className="w-full" size="lg" disabled={status==='verifying'}>
              {status==='verifying' ? <span className="animate-spin">⏳</span> : 'Verify OTP'}
            </Button>
          </form>

          <p className="mt-4 text-sm text-gray-500">
            Didn't receive it?{' '}
            <button
              onClick={handleResend}
              disabled={!canResend}
              className="text-primary-600 hover:underline disabled:text-gray-400"
            >
              {canResend ? 'Resend OTP' : `Resend in ${seconds}s`}
            </button>
          </p>
        </div>
      </PageContainer>
    </div>
  );
}