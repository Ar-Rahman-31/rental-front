// src/pages/OwnerLogin.jsx
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PageContainer } from '../components/layout/PageContainer';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export function OwnerLogin() {
  const navigate = useNavigate();
  const [, setSearch] = useSearchParams();
  const redirect = new URLSearchParams(window.location.search).get('redirect') || '/owner/dashboard';
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await login(authService.loginOwner, form);
      navigate(redirect, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <PageContainer className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary-700">
              <svg className="h-8 w-8" viewBox="0 0 24 24"><path fill="currentColor" d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg> DriveEase
            </Link>
            <h1 className="mt-6 text-2xl font-bold text-gray-900">Owner sign in</h1>
            <p className="mt-2 text-gray-600">Access your owner dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Input label="Email" id="email" type="email" autoComplete="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} error={errors.email} placeholder="owner@example.com" leftIcon={<Mail className="h-5 w-5 text-gray-400"/>} />
            <div className="relative">
              <Input label="Password" id="password" type={showPwd?'text':'password'} autoComplete="current-password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} error={errors.password} placeholder="••••••••" leftIcon={<Lock className="h-5 w-5 text-gray-400"/>} />
              <button type="button" className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-700" onClick={()=>setShowPwd(!showPwd)} aria-label={showPwd?'Hide password':'Show password'}>
                {showPwd?<EyeOff className="h-5 w-5"/>:<Eye className="h-5 w-5"/>}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"/> Remember me</label>
              <Link to="/owner/forgot-password" className="text-sm text-primary-600 hover:underline">Forgot password?</Link>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting?'Signing in…':'Sign in'}
            </Button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Not an owner? <Link to="/login" className="font-medium text-primary-600 hover:underline">Customer login</Link>
          </p>
          <p className="mt-2 text-center text-sm text-gray-500">Don't have an account? <Link to="/owner/register" className="font-medium text-primary-600 hover:underline">Owner sign up</Link></p>
        </div>
      </PageContainer>
    </div>
  );
}