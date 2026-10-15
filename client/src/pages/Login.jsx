// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { PageContainer } from '../components/layout/PageContainer';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff, User, Shield } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const [, setSearch] = useSearchParams();
  const redirect = new URLSearchParams(window.location.search).get('redirect') || '/dashboard';
  const { login } = useAuth();
  const [role, setRole] = useState('customer'); // 'customer' | 'owner' | 'admin'
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      let loginFn;
      if (role === 'owner') loginFn = authService.loginOwner;
      else if (role === 'admin') loginFn = authService.loginAdmin;
      else loginFn = authService.loginCustomer;

      await login(loginFn, form);

      // redirect based on role
      if (role === 'admin') navigate('/admin', { replace: true });
      else if (role === 'owner') navigate('/owner/dashboard', { replace: true });
      else navigate(redirect, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const roleOptions = [
    { value: 'customer', label: 'Customer' },
    { value: 'owner', label: 'Car Owner' },
    { value: 'admin', label: 'Admin' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <PageContainer className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary-700">
              <svg className="h-8 w-8" viewBox="0 0 24 24"><path fill="currentColor" d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg> DriveEase
            </Link>
            <h1 className="mt-6 text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="mt-2 text-gray-600">Sign in to your {role === 'admin' ? 'admin' : role === 'owner' ? 'owner' : 'customer'} account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Select label="Sign in as" name="role" value={role} onChange={e=>setRole(e.target.value)} options={[
              { value: 'customer', label: 'Customer' },
              { value: 'owner', label: 'Car Owner' },
              { value: 'admin', label: 'Admin' },
            ]} />
            <Input label="Email" id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="you@example.com" leftIcon={<Mail className="h-5 w-5 text-gray-400"/>} required />
            <div className="relative">
              <Input label="Password" id="password" name="password" type={showPwd?'text':'password'} autoComplete="current-password" value={form.password} onChange={handleChange} error={errors.password} placeholder="••••••••" leftIcon={<Lock className="h-5 w-5 text-gray-400"/>} required />
              <button type="button" className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-700" onClick={()=>setShowPwd(!showPwd)} aria-label={showPwd?'Hide password':'Show password'}>
                {showPwd?<EyeOff className="h-5 w-5"/>:<Eye className="h-5 w-5"/>}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"/> Remember me</label>
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">Forgot password?</Link>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting?'Signing in…':'Sign in'}
            </Button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            New here? <Link to="/register" className="font-medium text-primary-600 hover:underline">Create an account</Link>
          </p>
          <p className="mt-2 text-center text-sm text-gray-500">Are you a car owner? <Link to="/owner/login" className="font-medium text-primary-600 hover:underline">Owner login</Link></p>
        </div>
      </PageContainer>
    </div>
  );
}