import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

// Custom hook for managing API data with CRUD operations
export const useApiData = (apiService, initialData = []) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  // Fetch data from API
  const fetchData = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        ...filters,
        ...params,
      });
      
      if (response.data.success) {
        setData(response.data.data || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.total || 0,
        }));
      } else {
        throw new Error(response.data.error || 'Failed to fetch data');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiService, pagination.page, pagination.limit, searchTerm, filters]);

  // Create new item
  const createItem = useCallback(async (itemData) => {
    setLoading(true);
    
    try {
      const response = await apiService.create(itemData);
      
      if (response.data.success) {
        setData(prev => [response.data.data, ...prev]);
        toast.success('Item created successfully');
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to create item');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create item';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiService]);

  // Update existing item
  const updateItem = useCallback(async (id, itemData) => {
    setLoading(true);
    
    try {
      const response = await apiService.update(id, itemData);
      
      if (response.data.success) {
        setData(prev => prev.map(item => 
          item.id === id ? { ...item, ...response.data.data } : item
        ));
        toast.success('Item updated successfully');
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to update item');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update item';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiService]);

  // Delete item
  const deleteItem = useCallback(async (id) => {
    setLoading(true);
    
    try {
      const response = await apiService.delete(id);
      
      if (response.data.success) {
        setData(prev => prev.filter(item => item.id !== id));
        toast.success('Item deleted successfully');
        return true;
      } else {
        throw new Error(response.data.error || 'Failed to delete item');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to delete item';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiService]);

  // Get single item by ID
  const getItem = useCallback(async (id) => {
    setLoading(true);
    
    try {
      const response = await apiService.getById(id);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to fetch item');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch item';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiService]);

  // Search functionality
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Filter functionality
  const handleFilter = useCallback((newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Pagination
  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  const handleLimitChange = useCallback((newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  }, []);

  // Refresh data
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Filter data based on search term (client-side filtering as fallback)
  const filteredData = data.filter(item => {
    if (!searchTerm) return true;
    
    return Object.values(item).some(value => 
      value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    // Data
    data: filteredData,
    loading,
    error,
    
    // Pagination
    pagination,
    
    // Search and filters
    searchTerm,
    filters,
    
    // Actions
    createItem,
    updateItem,
    deleteItem,
    getItem,
    refresh,
    
    // Handlers
    handleSearch,
    handleFilter,
    handlePageChange,
    handleLimitChange,
    
    // Utilities
    setData,
    setLoading,
    setError,
  };
};

// Hook for managing dialog states
export const useDialogState = () => {
  const [dialogs, setDialogs] = useState({
    create: false,
    edit: false,
    delete: false,
    detail: false,
  });
  
  const [selectedItem, setSelectedItem] = useState(null);

  const openDialog = useCallback((type, item = null) => {
    setDialogs(prev => ({ ...prev, [type]: true }));
    if (item) setSelectedItem(item);
  }, []);

  const closeDialog = useCallback((type) => {
    setDialogs(prev => ({ ...prev, [type]: false }));
    if (type !== 'detail') setSelectedItem(null);
  }, []);

  const closeAllDialogs = useCallback(() => {
    setDialogs({
      create: false,
      edit: false,
      delete: false,
      detail: false,
    });
    setSelectedItem(null);
  }, []);

  return {
    dialogs,
    selectedItem,
    openDialog,
    closeDialog,
    closeAllDialogs,
    setSelectedItem,
  };
};

// Hook for form management
export const useFormState = (initialData = {}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    setErrors(prev => {
      if (prev[field]) {
        return { ...prev, [field]: null };
      }
      return prev;
    });
  }, []); // Removed errors dependency to avoid unnecessary re-renders

  const handleBlur = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const validateField = useCallback((field, value, rules = {}) => {
    if (rules.required && (!value || value.toString().trim() === '')) {
      return `${field} is required`;
    }
    
    if (rules.minLength && value && value.length < rules.minLength) {
      return `${field} must be at least ${rules.minLength} characters`;
    }
    
    if (rules.email && value && !/\S+@\S+\.\S+/.test(value)) {
      return 'Please enter a valid email address';
    }
    
    if (rules.pattern && value && !rules.pattern.test(value)) {
      return rules.message || `${field} format is invalid`;
    }
    
    return null;
  }, []);

  const validate = useCallback((validationRules = {}) => {
    const newErrors = {};
    
    Object.keys(validationRules).forEach(field => {
      const error = validateField(field, formData[field], validationRules[field]);
      if (error) {
        newErrors[field] = error;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);

  const reset = useCallback((newData = {}) => {
    setFormData(newData);
    setErrors({});
    setTouched({});
  }, []);

  return {
    formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate,
    reset,
    setFormData,
    setErrors,
  };
};

const ApiHooks = { useApiData, useDialogState, useFormState };
export default ApiHooks;
