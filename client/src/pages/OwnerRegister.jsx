// src/pages/OwnerRegister.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PageContainer } from '../components/layout/PageContainer';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react';

export function OwnerRegister() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.mobile) e.mobile = 'Mobile number is required';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'At least 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await register(authService.registerOwner, {
        name: form.name,
        email: form.email,
        mobile: form.mobile,
        password: form.password,
        confirmPassword: form.confirmPassword
      });
      navigate('/verify-email?email=' + encodeURIComponent(form.email));
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
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
            <h1 className="mt-6 text-2xl font-bold text-gray-900">Become a Car Owner</h1>
            <p className="mt-2 text-gray-600">List your vehicles and start earning</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Input label="Full name" id="name" name="name" value={form.name} onChange={handleChange} error={errors.name} placeholder="John Doe" leftIcon={<User className="h-5 w-5 text-gray-400"/>} required />
            <Input label="Email" id="email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="owner@example.com" leftIcon={<Mail className="h-5 w-5 text-gray-400"/>} required />
            <Input label="Mobile" id="mobile" name="mobile" value={form.mobile} onChange={handleChange} error={errors.mobile} placeholder="+1 555 123 4567" leftIcon={<Phone className="h-5 w-5 text-gray-400"/>} required />
            <div className="relative">
              <Input label="Password" id="password" name="password" type={showPwd?'text':'password'} value={form.password} onChange={handleChange} error={errors.password} placeholder="••••••••" leftIcon={<Lock className="h-5 w-5 text-gray-400"/>} required />
              <button type="button" className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-700" onClick={()=>setShowPwd(!showPwd)} aria-label={showPwd?'Hide password':'Show password'}>
                {showPwd?<EyeOff className="h-5 w-5"/>:<Eye className="h-5 w-5"/>}
              </button>
            </div>
            <Input label="Confirm password" id="confirmPassword" name="confirmPassword" type={showPwd?'text':'password'} value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} placeholder="••••••••" leftIcon={<Lock className="h-5 w-5 text-gray-400"/>} required />

            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting?'Creating account…':'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Already an owner? <Link to="/owner/login" className="font-medium text-primary-600 hover:underline">Sign in</Link>
          </p>
          <p className="mt-2 text-center text-sm text-gray-500">Just want to rent? <Link to="/register" className="font-medium text-primary-600 hover:underline">Customer sign up</Link></p>
        </div>
      </PageContainer>
    </div>
  );
}