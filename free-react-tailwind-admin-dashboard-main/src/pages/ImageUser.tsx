import { useState, useEffect, useCallback } from 'react';
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";

// SVG Icons
const GridIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const ListIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Interfaces
interface Image {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'inactive';
  file_format?: string;
  file_size_mb?: number;
  dimensions_display?: string;
  image_file?: string;
  image_url?: string;
}

interface Filters {
  status: string;
  file_format: string;
}

interface Stats {
  total_images: number;
  active_images: number;
  total_size_mb: number;
}

interface ImageCardProps {
  image: Image;
  onView: (image: Image) => void;
}

interface GridProps {
  images: React.ReactNode;
  className?: string;
}

// Images Service
const imagesService = {
  async getAll(filters: Filters = { status: '', file_format: '' }) {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof Filters]) {
        params.append(key, filters[key as keyof Filters]);
      }
    });
    const response = await fetch(`http://127.0.0.1:8000/api/images/?${params}`);
    if (!response.ok) throw new Error('Failed to fetch images');
    const data = await response.json();
    return data.results || data;
  },

  async getStats(): Promise<Stats> {
    const response = await fetch('http://127.0.0.1:8000/api/images/stats/');
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  }
};

const getFullImageUrl = (image: Image): string => {
  if (image.image_file && image.image_file.startsWith('http')) return image.image_file;
  if (image.image_url) {
    const baseUrl = 'http://127.0.0.1:8000';
    return image.image_url.startsWith('http') ? image.image_url : `${baseUrl}${image.image_url}`;
  }
  return '';
};

const ImageCard: React.FC<ImageCardProps> = ({ image, onView }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fullImageUrl = getFullImageUrl(image);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 group">
      <div 
        className="relative overflow-hidden cursor-pointer bg-gray-100 dark:bg-gray-700"
        onClick={() => onView(image)}
      >
        <div className="aspect-w-16 aspect-h-9 w-full h-40">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            </div>
          )}
          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-600">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs">Failed to load</p>
              </div>
            </div>
          ) : (
            <img
              src={fullImageUrl}
              alt={image.title}
              className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}
        </div>
        
        <div className="absolute top-2 right-2">
          <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${
            image.status === 'active' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {image.status === 'active' ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="p-3">
        <h3 className="font-medium text-gray-800 dark:text-white mb-1 line-clamp-1 text-sm">
          {image.title}
        </h3>
        
        {image.description && (
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
            {image.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
          <span>{image.file_format?.toUpperCase()}</span>
          <span>{image.file_size_mb} MB</span>
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-1 ${
            image.status === 'active'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {image.status === 'active' ? 'Active' : 'Inactive'}
          </span>
          
          <button
            onClick={() => onView(image)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

const TwoColumnImageGrid: React.FC<GridProps> = ({ images, className = '' }) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
    {images}
  </div>
);

const ThreeColumnImageGrid: React.FC<GridProps> = ({ images, className = '' }) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
    {images}
  </div>
);

export default function Images() {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingImage, setViewingImage] = useState<Image | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<Filters>({ status: '', file_format: '' });
  const [stats, setStats] = useState<Stats | null>(null);

  const loadImages = useCallback(async () => {
    setLoading(true);
    try {
      const filterParams: Filters = {
        status: filters.status,
        file_format: filters.file_format
      };
      const data = await imagesService.getAll(filterParams);
      setImages(data);
    } catch {
      console.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadStats = useCallback(async () => {
    try {
      const data = await imagesService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, []);

  useEffect(() => {
    loadImages();
    loadStats();
  }, [loadImages, loadStats]);

  const handleViewImage = (image: Image) => {
    setViewingImage(image);
  };

  const getFullImageUrlForViewer = (image: Image): string => {
    return getFullImageUrl(image);
  };

  const renderImageCards = () => {
    return images.map(image => (
      <ImageCard
        key={image.id}
        image={image}
        onView={handleViewImage}
      />
    ));
  };

  return (
    <div>
      <PageMeta
        title="Image Gallery | Admin Dashboard"
        description="Browse and view image gallery"
      />
      <PageBreadcrumb pageTitle="Image Gallery" />
      
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Image Gallery</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">Browse your image collection</p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100 dark:bg-gray-700 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 ${
                    viewMode === 'grid' 
                      ? 'bg-white dark:bg-gray-600 text-indigo-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <GridIcon />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 ${
                    viewMode === 'list' 
                      ? 'bg-white dark:bg-gray-600 text-indigo-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <ListIcon />
                </button>
              </div>
            </div>
          </div>

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 border border-blue-200 dark:border-blue-800">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.total_images}</div>
                <div className="text-xs text-blue-600 dark:text-blue-300">Total Images</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 border border-green-200 dark:border-green-800">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">{stats.active_images}</div>
                <div className="text-xs text-green-600 dark:text-green-300">Active</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 border border-purple-200 dark:border-purple-800">
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{stats.total_size_mb} MB</div>
                <div className="text-xs text-purple-600 dark:text-purple-300">Total Size</div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 border border-orange-200 dark:border-orange-800">
                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {images.filter(img => img.status === 'inactive').length}
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-300">Inactive</div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="text-indigo-600 dark:text-indigo-400">
                <FilterIcon />
              </div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Filter Images</h3>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className="min-w-[150px]">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="min-w-[150px]">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Format</label>
                <select
                  value={filters.file_format}
                  onChange={(e) => setFilters(prev => ({ ...prev, file_format: e.target.value }))}
                  className="w-full px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">All Formats</option>
                  <option value="jpg">JPG</option>
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                  <option value="gif">GIF</option>
                  <option value="webp">WEBP</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto mb-2 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">No images found</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">No images available in the gallery</p>
            </div>
          ) : viewMode === 'grid' ? (
            <ThreeColumnImageGrid images={renderImageCards()} />
          ) : (
            <TwoColumnImageGrid images={renderImageCards()} />
          )}
        </div>

        {viewingImage && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
            <div className="relative max-w-4xl w-full max-h-[70vh] overflow-y-auto">
              <button
                onClick={() => setViewingImage(null)}
                className="absolute top-2 right-2 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 p-1"
              >
                <CloseIcon />
              </button>
              
              <div className="bg-white dark:bg-gray-800">
                <img
                  src={getFullImageUrlForViewer(viewingImage)}
                  alt={viewingImage.title}
                  className="w-full h-auto max-h-[70vh] object-contain"
                />
                
                <div className="p-3">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                    {viewingImage.title}
                  </h3>
                  
                  {viewingImage.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {viewingImage.description}
                    </p>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <div>
                      <div className="font-medium">Format</div>
                      <div>{viewingImage.file_format?.toUpperCase()}</div>
                    </div>
                    <div>
                      <div className="font-medium">Size</div>
                      <div>{viewingImage.file_size_mb} MB</div>
                    </div>
                    <div>
                      <div className="font-medium">Dimensions</div>
                      <div>{viewingImage.dimensions_display}</div>
                    </div>
                    <div>
                      <div className="font-medium">Status</div>
                      <div className={`inline-flex items-center px-2 py-0.5 text-xs ${
                        viewingImage.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {viewingImage.status}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}