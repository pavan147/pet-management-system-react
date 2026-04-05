import { useState } from 'react';

/**
 * Custom hook for unified form submission handling
 * Manages loading states, success feedback, and error handling
 * 
 * Usage:
 * const { handleSubmit, loading, showSuccess, errors, setShowSuccess } = useFormSubmit(submitFn, {
 *   onSuccess: () => console.log('Done!'),
 *   resetForm: () => setForm({})
 * });
 */
export const useFormSubmit = (submitFn, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (data) => {
    setLoading(true);
    setErrors({});
    try {
      await submitFn(data);
      setShowSuccess(true);
      
      // Call onSuccess callback if provided
      if (options.resetForm) {
        options.resetForm();
      }
      if (options.onSuccess) {
        options.onSuccess();
      }
    } catch (error) {
      // Handle different error formats
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: error.message || 'An error occurred' });
      }
    } finally {
      setLoading(false);
    }
  };

  const resetErrors = () => setErrors({});
  const resetSuccess = () => setShowSuccess(false);

  return {
    handleSubmit,
    loading,
    showSuccess,
    errors,
    setShowSuccess,
    resetErrors,
    resetSuccess,
  };
};
