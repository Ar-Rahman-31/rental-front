import { useState } from 'react';
import { useCars } from '../hooks/useCars';
import { CarCard } from '../components/common/CarCard';
import { Pagination } from '../components/ui/Pagination';
import { PageContainer } from '../components/layout/PageContainer';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Filter, X } from 'lucide-react';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorMessage } from '../components/ui/ErrorMessage';

const initialFilters = {
  q: '',
  location: '',
  minPrice: '',
  maxPrice: '',
  seats: '',
  sort: 'newest',
  page: 1,
  limit: 12,
  pickup: '',
  return: '',
};

export function ExploreCars() {
  const [filters, setFilters] = useState(initialFilters);

  const { data, isLoading, isError, refetch } = useCars(filters);

  // Supports both a direct API response and an Axios response.
  const response = data?.data ?? data;

  // Backend returns: { success, data: [...], pagination: {...} }
  const cars = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response)
      ? response
      : [];

  const pagination = response?.pagination ?? response?.meta ?? {};

  const currentPage = Number(pagination.page) || filters.page;
  const totalPages =
    Number(pagination.totalPages ?? pagination.lastPage) || 1;

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const clear = () => {
    setFilters({ ...initialFilters });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageContainer>
        <form
          onSubmit={handleSearch}
          className="mb-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
            <Input
              label="Keyword"
              id="q"
              value={filters.q}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, q: e.target.value }))
              }
              placeholder="Brand, model..."
            />

            <Input
              label="Location"
              id="location"
              value={filters.location}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  location: e.target.value,
                }))
              }
              placeholder="City / airport"
            />

            <Input
              label="Min $/day"
              type="number"
              id="minPrice"
              min="0"
              value={filters.minPrice}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  minPrice: e.target.value,
                }))
              }
            />

            <Input
              label="Max $/day"
              type="number"
              id="maxPrice"
              min="0"
              value={filters.maxPrice}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  maxPrice: e.target.value,
                }))
              }
            />

            <Select
              label="Seats"
              id="seats"
              value={filters.seats}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  seats: e.target.value,
                }))
              }
              options={[
                { value: '', label: 'Any seats' },
                { value: '2', label: '2 seats' },
                { value: '4', label: '4 seats' },
                { value: '5', label: '5 seats' },
                { value: '7', label: '7 seats' },
                { value: '9', label: '9 seats' },
              ]}
            />

            <Select
              label="Sort"
              id="sort"
              value={filters.sort}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  sort: e.target.value,
                  page: 1,
                }))
              }
              options={[
                { value: 'newest', label: 'Newest' },
                { value: 'price_asc', label: 'Price ↑' },
                { value: 'price_desc', label: 'Price ↓' },
              ]}
            />

            <div className="flex items-end gap-2">
              <Button type="submit">
                <Filter className="mr-2 h-4 w-4" />
                Search
              </Button>

              <Button type="button" variant="outline" onClick={clear}>
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>
          </div>
        </form>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-100 bg-white p-4"
              >
                <LoadingSkeleton className="mb-3 h-40 w-full rounded-lg" />
                <LoadingSkeleton className="mb-2 h-4 w-3/4 rounded" />
                <LoadingSkeleton className="h-4 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <ErrorMessage
            message="Failed to load cars"
            onRetry={() => refetch()}
          />
        ) : cars.length === 0 ? (
          <EmptyState
            title="No cars match your filters"
            description="Try changing your search or filters."
          />
        ) : (
          <>
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {cars.map((car) => (
                <CarCard key={car._id} car={car} />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                current={currentPage}
                total={totalPages}
                onChange={(page) =>
                  setFilters((prev) => ({ ...prev, page }))
                }
              />
            )}
          </>
        )}
      </PageContainer>
    </div>
  );
}