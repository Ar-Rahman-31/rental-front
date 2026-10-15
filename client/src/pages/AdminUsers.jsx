import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { User, Lock, Unlock, Search } from 'lucide-react';
import { formatDate } from '../utils/format';
import { toast } from 'sonner';

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const totalPages = 1;

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', { params: { page, limit: 20, role: roleFilter, q: search } });
      setUsers(res.data.data);
      // meta not returned but we can compute pages if needed
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [page, roleFilter]);

  const handleBlock = async (user) => {
    try {
      await api.patch(`/admin/users/${user._id}/block`);
      toast.success(user.isBlocked ? 'User unblocked' : 'User blocked');
      setUsers(users.map(u => u._id === user._id ? { ...u, isBlocked: !u.isBlocked } : u));
    } catch (e) {
      toast.error('Failed to toggle block');
    }
  };

  if (loading) return <UsersSkeleton />;
  if (error) return <ErrorMessage message={error} onRetry={fetch} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageContainer>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">User Management</h1>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 mb-6 flex gap-4 flex-wrap">
          <input type="text" placeholder="Search email/name" value={search} onChange={e=>setSearch(e.target.value)} className="flex-1 min-w-[200px] rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500" />
          <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500">
            <option value="">All Roles</option>
            <option value="customer">Customer</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {users.length===0 ? <EmptyState title="No users found" description="Try adjusting filters." /> : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl border border-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">{u.name}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3"><Badge variant={u.role==='admin'?'info':u.role==='owner'?'warning':'default'}>{u.role}</Badge></td>
                    <td className="px-4 py-3"><Badge variant={u.isBlocked?'danger':'success'}>{u.isBlocked?'Blocked':'Active'}</Badge></td>
                    <td className="px-4 py-3">
                      {u.role !== 'admin' && (
                        <Button variant="outline" size="sm" onClick={()=>handleBlock(u)}>
                          {u.isBlocked ? <Unlock className="h-4 w-4"/> : <Lock className="h-4 w-4"/>}
                          {u.isBlocked ? ' Unblock' : ' Block'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PageContainer>
    </div>
  );
}

function UsersSkeleton() {
  return (
    <PageContainer>
      <LoadingSkeleton className="h-10 w-1/4 mb-8 rounded" />
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        {[...Array(5)].map((_, i) => <LoadingSkeleton key={i} className="h-12 w-full mb-3 rounded" />)}
      </div>
    </PageContainer>
  );
}