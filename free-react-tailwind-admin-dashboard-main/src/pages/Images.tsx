import { useState, useEffect, ChangeEvent, FormEvent, useCallback } from 'react';
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";

// SVG Icons
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const DeleteIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SuccessIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ErrorIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

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

interface FormData {
  title: string;
  description: string;
  image_file: File | null;
  status: 'active' | 'inactive';
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

interface Message {
  type: 'success' | 'error';
  text: string;
}

interface CenterNotificationProps {
  type: 'success' | 'error';
  text: string;
  onClose: () => void;
}

interface ImageCardProps {
  image: Image;
  onEdit: (image: Image) => void;
  onDelete: (image: Image) => void;
  onToggleStatus: (image: Image) => void;
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

  async create(data: FormData) {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description || '');
    formData.append('status', data.status);
    if (data.image_file) formData.append('image_file', data.image_file);

    const response = await fetch('http://127.0.0.1:8000/api/images/', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to create image');
    return response.json();
  },

  async update(id: string, data: Partial<FormData>) {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.status) formData.append('status', data.status);
    if (data.image_file) formData.append('image_file', data.image_file);

    const response = await fetch(`http://127.0.0.1:8000/api/images/${id}/`, {
      method: 'PATCH',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to update image');
    return response.json();
  },

  async delete(id: string) {
    const response = await fetch(`http://127.0.0.1:8000/api/images/${id}/`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete image');
  },

  async toggleStatus(id: string) {
    const response = await fetch(`http://127.0.0.1:8000/api/images/${id}/toggle_status/`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to toggle status');
    return response.json();
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

const SUCCESS_MESSAGES = {
  create: "Image uploaded successfully!",
  update: "Image updated successfully!",
  delete: "Image deleted successfully!",
  status: "Image status updated successfully!"
};

const ERROR_MESSAGES = {
  create: "Failed to upload image.",
  update: "Failed to update image.",
  delete: "Failed to delete image.",
  fetch: "Failed to load images.",
  status: "Failed to update image status."
};

const CenterNotification: React.FC<CenterNotificationProps> = ({ type, text, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className={`relative max-w-md w-full mx-4 ${
      type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
    } border-2 p-4`}>
      <div className="flex items-center">
        <div className={`flex-shrink-0 ${type === 'success' ? 'text-green-900' : 'text-red-400'}`}>
          {type === 'success' ? <SuccessIcon /> : <ErrorIcon />}
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-semibold ${type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
            {type === 'success' ? 'Success!' : 'Error!'}
          </h3>
          <p className={`mt-1 text-sm ${type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
            {text}
          </p>
        </div>
        <button onClick={onClose} className="ml-4 text-current hover:opacity-70">
          <CloseIcon />
        </button>
      </div>
      <div className="mt-3 flex justify-end">
        <button
          onClick={onClose}
          className={`px-3 py-1 text-sm font-medium ${
            type === 'success' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          OK
        </button>
      </div>
    </div>
  </div>
);

const ImageCard: React.FC<ImageCardProps> = ({ image, onEdit, onDelete, onToggleStatus, onView }) => {
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
          <button
            onClick={() => onToggleStatus(image)}
            className={`text-xs px-2 py-1 ${
              image.status === 'active'
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {image.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(image)}
              className="p-1 text-blue-600 hover:text-blue-800"
              title="Edit"
            >
              <EditIcon />
            </button>
            <button
              onClick={() => onDelete(image)}
              className="p-1 text-red-600 hover:text-red-800"
              title="Delete"
            >
              <DeleteIcon />
            </button>
          </div>
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
  const [showForm, setShowForm] = useState(false);
  const [editingImage, setEditingImage] = useState<Image | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<Image | null>(null);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState<Message>({ type: 'success', text: '' });
  const [viewingImage, setViewingImage] = useState<Image | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<Filters>({ status: '', file_format: '' });
  const [stats, setStats] = useState<Stats | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    image_file: null,
    status: 'active'
  });

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
      showNotification('error', ERROR_MESSAGES.fetch);
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

  const showNotification = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setShowMessage(true);
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingImage) {
        await imagesService.update(editingImage.id, formData);
        showNotification('success', SUCCESS_MESSAGES.update);
      } else {
        await imagesService.create(formData);
        showNotification('success', SUCCESS_MESSAGES.create);
      }
      setShowForm(false);
      setEditingImage(null);
      resetForm();
      loadImages();
      loadStats();
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : (editingImage ? ERROR_MESSAGES.update : ERROR_MESSAGES.create));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_file: null,
      status: 'active'
    });
  };

  const handleEdit = (image: Image) => {
    setFormData({
      title: image.title,
      description: image.description || '',
      image_file: null,
      status: image.status
    });
    setEditingImage(image);
    setShowForm(true);
  };

  const handleDeleteClick = (image: Image) => {
    setImageToDelete(image);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!imageToDelete) return;
    
    setLoading(true);
    try {
      await imagesService.delete(imageToDelete.id);
      showNotification('success', SUCCESS_MESSAGES.delete);
      setShowDeleteConfirm(false);
      setImageToDelete(null);
      loadImages();
      loadStats();
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : ERROR_MESSAGES.delete);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (image: Image) => {
    setLoading(true);
    try {
      await imagesService.toggleStatus(image.id);
      showNotification('success', SUCCESS_MESSAGES.status);
      loadImages();
      loadStats();
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : ERROR_MESSAGES.status);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, image_file: file }));
  };

  const handleNewImage = () => {
    resetForm();
    setEditingImage(null);
    setShowForm(true);
  };

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
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onToggleStatus={handleToggleStatus}
        onView={handleViewImage}
      />
    ));
  };

  return (
    <div>
      <PageMeta
        title="Image Gallery Management | Admin Dashboard"
        description="Manage and organize your image gallery"
      />
      <PageBreadcrumb pageTitle="Image Gallery" />
      
      <div className="space-y-4">
        {showMessage && (
          <CenterNotification
            type={message.type}
            text={message.text}
            onClose={() => setShowMessage(false)}
          />
        )}

        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Image Gallery</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">Manage your image collection</p>
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

              <button
                onClick={handleNewImage}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 flex items-center gap-1 text-sm"
              >
                <PlusIcon />
                Upload Image
              </button>
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
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Upload your first image</p>
              <button
                onClick={handleNewImage}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-sm"
              >
                Upload Image
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <ThreeColumnImageGrid images={renderImageCards()} />
          ) : (
            <TwoColumnImageGrid images={renderImageCards()} />
          )}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 w-full max-w-2xl max-h-[70vh] overflow-y-auto">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-indigo-600 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    {editingImage ? 'Edit Image' : 'Upload New Image'}
                  </h2>
                  <button onClick={() => setShowForm(false)} className="text-white hover:text-gray-200">
                    <CloseIcon />
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleFormSubmit} className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Enter image title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Enter image description"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Image File {!editingImage && '*'}
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex-1 cursor-pointer">
                        <input
                          type="file"
                          required={!editingImage}
                          onChange={handleFileChange}
                          className="hidden"
                          accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.svg"
                        />
                        <div className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-indigo-400 text-center text-sm">
                          <svg className="w-4 h-4 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Choose Image
                        </div>
                      </label>
                      {formData.image_file && (
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                          {formData.image_file.name}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      JPG, PNG, GIF, WEBP, SVG files accepted
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-1.5 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : (editingImage ? 'Update Image' : 'Upload Image')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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

        {showDeleteConfirm && imageToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md">
              <div className="px-4 py-3 border-b border-red-200 bg-red-500 text-white">
                <h2 className="text-lg font-semibold">Confirm Delete</h2>
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-center w-10 h-10 mx-auto mb-3 bg-red-100">
                  <ErrorIcon />
                </div>
                <p className="text-center text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Are you sure you want to delete this image?
                </p>
                <p className="text-center font-semibold text-gray-900 dark:text-white mb-3">
                  "{imageToDelete.title}"
                </p>
                <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                  This action cannot be undone.
                </p>
              </div>
              
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-1.5 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={loading}
                  className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete Image'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}