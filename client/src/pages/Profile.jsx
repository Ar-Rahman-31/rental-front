// src/pages/Profile.jsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PageContainer } from '../components/layout/PageContainer';
import { toast } from 'sonner';
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';

export function Profile() {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [saving, setSaving] = useState(false);

  const validateProfile = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name required';
    if (!form.email) e.email = 'Email required';
    if (!form.mobile) e.mobile = 'Mobile required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePassword = () => {
    const e = {};
    if (!form.currentPassword) e.currentPassword = 'Current password required';
    if (!form.newPassword) e.newPassword = 'New password required';
    else if (form.newPassword.length < 8) e.newPassword = 'At least 8 chars';
    if (form.newPassword !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const saveProfile = async () => {
    if (!validateProfile()) return;
    setSaving(true);
    try {
      await authService.updateProfile({ name: form.name, email: form.email, mobile: form.mobile });
      toast.success('Profile updated');
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (!validatePassword()) return;
    setSaving(true);
    try {
      await authService.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password changed');
      setForm(f => ({ ...f, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageContainer>
        <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="space-y-4">
              <Input label="Full name" id="name" name="name" value={form.name} onChange={handleChange} error={errors.name} leftIcon={<User className="h-5 w-5 text-gray-400"/>} />
              <Input label="Email" id="email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} leftIcon={<Mail className="h-5 w-5 text-gray-400"/>} />
              <Input label="Mobile" id="mobile" name="mobile" value={form.mobile} onChange={handleChange} error={errors.mobile} leftIcon={<Phone className="h-5 w-5 text-gray-400"/>} />
              <Button onClick={saveProfile} disabled={saving} className="w-full sm:w-auto">
                {saving?'Saving…':'Save changes'}
              </Button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            <div className="space-y-4">
              <div className="relative">
                <Input label="Current password" id="currentPassword" name="currentPassword" type={showPwd?'text':'password'} value={form.currentPassword} onChange={handleChange} error={errors.currentPassword} leftIcon={<Lock className="h-5 w-5 text-gray-400"/>} />
                <button type="button" className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-700" onClick={()=>setShowPwd(!showPwd)} aria-label={showPwd?'Hide':'Show'}>
                  {showPwd?<EyeOff className="h-5 w-5"/>:<Eye className="h-5 w-5"/>}
                </button>
              </div>
              <Input label="New password" id="newPassword" name="newPassword" type={showPwd?'text':'password'} value={form.newPassword} onChange={handleChange} error={errors.newPassword} leftIcon={<Lock className="h-5 w-5 text-gray-400"/>} />
              <Input label="Confirm new password" id="confirmPassword" name="confirmPassword" type={showPwd?'text':'password'} value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} leftIcon={<Lock className="h-5 w-5 text-gray-400"/>} />
              <Button onClick={changePassword} disabled={saving} className="w-full sm:w-auto">
                {saving?'Updating…':'Change password'}
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}