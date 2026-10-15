// src/pages/VerifyEmail.jsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { toast } from 'sonner';
import { Loader2, Mail, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PageContainer } from '../components/layout/PageContainer';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resendVerification } = useAuth();

  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const [status, setStatus] = useState('idle'); // idle | verifying | success | expired | error

  useEffect(() => {
    if (!token) return;
    verify();
  }, [token]);

  const verify = async () => {
    setStatus('verifying');
    try {
      await authService.verifyEmail(token);
      toast.success('Email verified successfully. Please log in.');
      setStatus('success');
      // redirect after short delay to allow toast to show
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      if (err.response?.status === 400) setStatus('expired');
      else setStatus('error');
    }
  };

  const handleResend = async () => {
    if (!email) return toast.error('Email missing');
    try {
      await resendVerification(email);
      toast.success('Verification e‑mail sent');
    } catch { toast.error('Could not resend'); }
  };

  const icons = {
    idle: <Mail className="h-12 w-12 text-gray-300" />,
    verifying: <Loader2 className="animate-spin h-12 w-12 text-primary-600" />,
    success: <CheckCircle className="h-12 w-12 text-green-500" />,
    expired: <AlertCircle className="h-12 w-12 text-yellow-500" />,
    error: <AlertCircle className="h-12 w-12 text-red-500" />
  };

  const messages = {
    idle: 'Check your inbox and click the verification link.',
    verifying: 'Verifying…',
    success: 'E‑mail verified! Redirecting to login…',
    expired: 'The link has expired or is invalid.',
    error: 'Something went wrong.'
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <PageContainer className="w-full max-w-md text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {icons[status]}
          <h1 className="mt-4 text-xl font-bold text-gray-900">{messages[status]}</h1>

          {(status === 'expired' || status === 'idle') && email && (
            <Button variant="outline" className="mt-6" onClick={handleResend}>
              <RotateCcw className="h-4 w-4 mr-2" /> Resend verification e‑mail
            </Button>
          )}
        </div>
      </PageContainer>
    </div>
  );
}