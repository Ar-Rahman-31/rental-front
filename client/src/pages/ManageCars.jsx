// src/pages/ManageCars.jsx
import { useMyCars, useDeleteCar } from '../hooks/useCars';
import { CarCard } from '../components/common/CarCard';
import { Button } from '../components/ui/Button';
import { PageContainer } from '../components/layout/PageContainer';
import { Link } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';

export function ManageCars() {
  const { data, isLoading } = useMyCars();
  const deleteCar = useDeleteCar();
  const cars = data?.data ?? [];

  const handleDelete = async (id) => {
    if (!confirm('Delete this car permanently?')) return;
    try { await deleteCar.mutateAsync(id); toast.success('Car deleted'); } catch { toast.error('Delete failed'); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageContainer>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My cars</h1>
          <Link to="/owner/add-car"><Button><Plus className="h-4 w-4 mr-2"/>Add car</Button></Link>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_,i)=><div key={i} className="bg-white rounded-xl border border-gray-100 p-4"><LoadingSkeleton className="h-40 w-full mb-3 rounded-lg"/><LoadingSkeleton className="h-4 w-3/4 mb-2 rounded"/><LoadingSkeleton className="h-4 w-1/2 rounded"/></div>)}
          </div>
        ) : cars.length===0 ? (
          <EmptyState title="No cars yet" description="You haven't listed any cars yet." action={<Link to="/owner/add-car"><Button>Add your first car</Button></Link>} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map(c=>(
              <div key={c._id} className="relative">
                <CarCard car={c} ownerView />
                <div className="absolute top-2 right-2 flex gap-1">
                  <Link to={`/owner/cars/${c._id}/edit`} className="p-1 bg-white/80 rounded hover:bg-white"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></Link>
                  <button onClick={()=>handleDelete(c._id)} className="p-1 bg-white/80 rounded hover:bg-white text-red-600"><Trash2 className="h-4 w-4"/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
}