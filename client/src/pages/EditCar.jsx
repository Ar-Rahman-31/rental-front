// src/pages/EditCar.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCar } from '../hooks/useCars';
import { useUpdateCar } from '../hooks/useCars';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { PageContainer } from '../components/layout/PageContainer';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { toast } from 'sonner';

export function EditCar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: car, isLoading, isError } = useCar(id);
  const updateCar = useUpdateCar();

  const [form, setForm] = useState({
    brand: '',
    model: '',
    registrationNumber: '',
    seatingCapacity: '',
    pricePerDay: '',
    location: '',
    description: ''
  });
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    if (car) {
      setForm({
        brand: car.brand,
        model: car.model,
        registrationNumber: car.registrationNumber,
        seatingCapacity: String(car.seatingCapacity),
        pricePerDay: String(car.pricePerDay),
        location: car.location,
        description: car.description || ''
      });
      setExistingImages(car.images || []);
    }
  }, [car]);

  const handleChange = (e) => setForm(f=>({...f,[e.target.name]:e.target.value}));
  const handleFiles = (e) => {
    const arr = Array.from(e.target.files);
    if (arr.length > 8) return toast.error('Maximum 8 images');
    setFiles(arr);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k,v])=>fd.append(k,v));
    files.forEach(f=>fd.append('images',f));
    try {
      await updateCar.mutateAsync({ id, data: fd });
      toast.success('Car updated');
      navigate('/owner/cars');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update car');
    }
  };

  if (isLoading) return (
    <PageContainer>
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <LoadingSkeleton className="h-40 w-full mb-3 rounded-lg"/>
        <LoadingSkeleton className="h-4 w-3/4 mb-2 rounded"/>
        <LoadingSkeleton className="h-4 w-1/2 rounded"/>
      </div>
    </PageContainer>
  );
  if (isError) return <ErrorMessage message="Car not found" onRetry={()=>window.location.reload()}/>;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageContainer>
        <h1 className="text-3xl font-bold mb-6">Edit car</h1>
        <form onSubmit={onSubmit} className="space-y-6 max-w-2xl" encType="multipart/form-data">
          <Input label="Brand" name="brand" value={form.brand} onChange={handleChange} required />
          <Input label="Model" name="model" value={form.model} onChange={handleChange} required />
          <Input label="Registration number" name="registrationNumber" value={form.registrationNumber} onChange={handleChange} required />
          <Select label="Seats" name="seatingCapacity" value={form.seatingCapacity} onChange={handleChange} options={['2','4','5','7','9']} required />
          <Input label="Price per day ($)" type="number" name="pricePerDay" value={form.pricePerDay} onChange={handleChange} required />
          <Input label="Pickup location" name="location" value={form.location} onChange={handleChange} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current photos</label>
            {existingImages.length===0 ? <p className="text-gray-500">No images</p> : (
              <div className="grid gap-2 sm:grid-cols-3">
                {existingImages.map((img,i)=>(
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                    <img src={img.url} alt="" className="w-full h-full object-cover"/>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Replace / add photos (max 8, ≤5 MB each)</label>
            <input type="file" accept="image/*" multiple onChange={handleFiles} className="w-full"/>
            {files.length && <div className="mt-2 flex flex-wrap gap-2">{files.map((f,i)=><span key={i} className="px-2 py-1 bg-gray-100 rounded text-sm">{f.name}</span>)}</div>}
          </div>
          <Button type="submit" className="w-full sm:w-auto" size="lg" disabled={updateCar.isPending}>
            {updateCar.isPending?'Updating…':'Save changes'}
          </Button>
        </form>
      </PageContainer>
    </div>
  );
}