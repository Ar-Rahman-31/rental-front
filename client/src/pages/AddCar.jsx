
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { carService } from '../services/carService';

export default function AddCar() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    brand: '',
    model: '',
    registrationNumber: '',
    seatingCapacity: '4',
    pricePerDay: '',
    location: '',
    description: '',
  });

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePhotos = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length > 8) {
      setError('You can upload a maximum of 8 photos.');
      setPhotos([]);
      event.target.value = '';
      return;
    }

    const invalidFile = selectedFiles.find(
      (file) =>
        !file.type.startsWith('image/') ||
        file.size > 5 * 1024 * 1024
    );

    if (invalidFile) {
      setError('Each photo must be an image up to 5 MB.');
      setPhotos([]);
      event.target.value = '';
      return;
    }

    setError('');
    setPhotos(selectedFiles);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (
      !form.brand.trim() ||
      !form.model.trim() ||
      !form.registrationNumber.trim() ||
      !form.seatingCapacity ||
      !form.pricePerDay ||
      !form.location.trim()
    ) {
      setError('Please fill in all required fields.');
      return;
    }

    if (
      !Number.isInteger(Number(form.seatingCapacity)) ||
      Number(form.seatingCapacity) < 1
    ) {
      setError('Seating capacity must be a positive integer.');
      return;
    }

    if (
      !Number.isFinite(Number(form.pricePerDay)) ||
      Number(form.pricePerDay) <= 0
    ) {
      setError('Price per day must be greater than zero.');
      return;
    }

    const formData = new FormData();

    formData.append('brand', form.brand.trim());
    formData.append('model', form.model.trim());
    formData.append(
      'registrationNumber',
      form.registrationNumber.trim().toUpperCase()
    );
    formData.append('seatingCapacity', form.seatingCapacity);
    formData.append('pricePerDay', form.pricePerDay);
    formData.append('location', form.location.trim());
    formData.append('description', form.description.trim());

    photos.forEach((photo) => {
      formData.append('photos', photo);
    });

    setLoading(true);

    try {
      const response = await carService.create(formData);
      const result = response.data;

      if (!result?.success) {
        throw new Error(result?.message || 'Unable to create car.');
      }

      setSuccess(
        result.message || 'Car submitted for admin review.'
      );

      setForm({
        brand: '',
        model: '',
        registrationNumber: '',
        seatingCapacity: '4',
        pricePerDay: '',
        location: '',
        description: '',
      });

      setPhotos([]);

      event.target.reset();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to add car.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">Add new car</h1>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg bg-red-100 p-3 text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mb-4 rounded-lg bg-green-100 p-3 text-green-700"
        >
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="brand" className="mb-1 block font-medium">
            Brand *
          </label>
          <input
            id="brand"
            name="brand"
            value={form.brand}
            onChange={handleChange}
            required
            className="w-full rounded-lg border p-3"
            placeholder="Maruti Suzuki"
          />
        </div>

        <div>
          <label htmlFor="model" className="mb-1 block font-medium">
            Model *
          </label>
          <input
            id="model"
            name="model"
            value={form.model}
            onChange={handleChange}
            required
            className="w-full rounded-lg border p-3"
            placeholder="Swift VXI"
          />
        </div>

        <div>
          <label
            htmlFor="registrationNumber"
            className="mb-1 block font-medium"
          >
            Registration number *
          </label>
          <input
            id="registrationNumber"
            name="registrationNumber"
            value={form.registrationNumber}
            onChange={handleChange}
            required
            className="w-full rounded-lg border p-3"
            placeholder="MP04AB1234"
          />
        </div>

        <div>
          <label
            htmlFor="seatingCapacity"
            className="mb-1 block font-medium"
          >
            Seats *
          </label>
          <select
            id="seatingCapacity"
            name="seatingCapacity"
            value={form.seatingCapacity}
            onChange={handleChange}
            required
            className="w-full rounded-lg border p-3"
          >
            {[2, 4, 5, 6, 7, 8, 9, 10].map((seat) => (
              <option key={seat} value={seat}>
                {seat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="pricePerDay"
            className="mb-1 block font-medium"
          >
            Price per day (₹) *
          </label>
          <input
            id="pricePerDay"
            name="pricePerDay"
            type="number"
            min="1"
            step="0.01"
            value={form.pricePerDay}
            onChange={handleChange}
            required
            className="w-full rounded-lg border p-3"
            placeholder="2000"
          />
        </div>

        <div>
          <label htmlFor="location" className="mb-1 block font-medium">
            Pickup location *
          </label>
          <input
            id="location"
            name="location"
            value={form.location}
            onChange={handleChange}
            required
            className="w-full rounded-lg border p-3"
            placeholder="Bhopal"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-1 block font-medium"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-lg border p-3"
            placeholder="Describe your car..."
          />
        </div>

        <div>
          <label htmlFor="photos" className="mb-1 block font-medium">
            Photos (maximum 8, 5 MB each)
          </label>
          <input
            id="photos"
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotos}
            className="w-full rounded-lg border p-3"
          />

          {photos.length > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              {photos.length} photo(s) selected
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
        >
          {loading ? 'Submitting...' : 'Submit car'}
        </button>
      </form>
    </div>
  );
}
