import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { LicenseService } from '../../services/api';
import { Save, ArrowLeft, Loader2, AlertCircle, Calendar } from 'lucide-react';

const LicenseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    productName: '',
    vendor: '',
    licenseType: 0, 
    totalEntitlements: 0,
    cost: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    currency: 'INR'
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadLicense();
    }
  }, [id]);

  const loadLicense = async () => {
    try {
      const response = await LicenseService.getById(id);
      const data = response.data;
      // Format dates for HTML input (YYYY-MM-DD required for value attribute)
      if(data.purchaseDate) data.purchaseDate = data.purchaseDate.split('T')[0];
      if(data.expiryDate) data.expiryDate = data.expiryDate.split('T')[0];
      setFormData(data);
    } catch (error) {
      alert("Failed to load software data");
      navigate('/inventory');
    }
  };

  // Helper to format YYYY-MM-DD to DD-MM-YYYY for display
  const formatDisplayDate = (isoDate) => {
    if (!isoDate) return '';
    const [y, m, d] = isoDate.split('-');
    return `${d}-${m}-${y}`;
  };

  const validateDates = (name, value) => {
    if (!value) return ""; 
    
    // Parse inputs manually to avoid UTC/Local timezone issues
    const [y, m, d] = value.split('-').map(Number);
    // Note: Month is 0-indexed in JS Date
    const inputDate = new Date(y, m - 1, d); 
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight local time

    if (name === 'purchaseDate') {
      if (inputDate > today) {
        return "Purchase date cannot be in the future.";
      }
    }
    if (name === 'expiryDate') {
      if (inputDate <= today) {
        return "Expiry date must be a future date.";
      }
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'licenseType' || name === 'totalEntitlements' ? parseInt(value) : value
    }));

    if (name === 'purchaseDate' || name === 'expiryDate') {
      const errorMsg = validateDates(name, value);
      setErrors(prev => ({ ...prev, [name]: errorMsg }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final Validation Check
    const purchaseError = validateDates('purchaseDate', formData.purchaseDate);
    const expiryError = formData.expiryDate ? validateDates('expiryDate', formData.expiryDate) : "";

    if (purchaseError || expiryError) {
      setErrors({ purchaseDate: purchaseError, expiryDate: expiryError });
      return; 
    }

    setLoading(true);
    try {
      if (isEditing) {
        await LicenseService.update(id, formData);
      } else {
        await LicenseService.create(formData);
      }
      navigate('/inventory');
    } catch (error) {
      console.error(error);
      alert("Failed to save details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <style>{`
        .form-container { padding: 2rem; max-width: 48rem; margin: 0 auto; }
        .form-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
        .back-link { padding: 0.5rem; border-radius: 9999px; color: #4b5563; display: flex; align-items: center; justify-content: center; transition: background-color 0.2s; }
        .back-link:hover { background-color: #f3f4f6; }
        .title-group h1 { font-size: 1.5rem; font-weight: 700; color: #1f2937; margin: 0; }
        .title-group p { color: #6b7280; font-size: 0.875rem; margin: 0.25rem 0 0 0; }
        
        .form-card { background-color: white; padding: 2rem; border-radius: 0.75rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); border: 1px solid #f3f4f6; }
        .form-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
        @media (min-width: 768px) { .form-grid { grid-template-columns: 1fr 1fr; } }
        .full-width { grid-column: 1 / -1; }
        
        .form-group label { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.25rem; }
        .form-input { width: 100%; padding: 0.5rem 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; outline: none; box-sizing: border-box; }
        .form-input:focus { border-color: #2563EB; box-shadow: 0 0 0 1px #2563EB; }
        .form-input.error { border-color: #dc2626; background-color: #fef2f2; }
        
        .error-msg { color: #dc2626; font-size: 0.75rem; margin-top: 0.25rem; display: flex; align-items: center; gap: 0.25rem; }
        .date-hint { font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem; display: flex; align-items: center; gap: 0.25rem; }
        
        .form-actions { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #f3f4f6; display: flex; justify-content: flex-end; gap: 1rem; }
        .btn { padding: 0.5rem 1.5rem; border-radius: 0.5rem; font-weight: 500; cursor: pointer; border: none; text-decoration: none; display: flex; align-items: center; gap: 0.5rem; }
        .btn-cancel { color: #4b5563; background-color: transparent; }
        .btn-cancel:hover { background-color: #f3f4f6; }
        .btn-submit { background-color: #2563EB; color: white; }
        .btn-submit:hover { background-color: #1d4ed8; }
        .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div className="form-header">
        <Link to="/inventory" className="back-link">
          <ArrowLeft size={24} />
        </Link>
        <div className="title-group">
          <h1>{isEditing ? 'Edit Software' : 'Add New Software'}</h1>
          <p>Fill in the details below to track a new software asset.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-grid">
          <div className="form-group full-width">
            <label>Product Name</label>
            <input
              required
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g. Microsoft Office 365"
            />
          </div>

          <div className="form-group">
            <label>Vendor</label>
            <input
              required
              name="vendor"
              value={formData.vendor}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g. Microsoft"
            />
          </div>

          <div className="form-group">
            <label>License Type</label>
            <select
              name="licenseType"
              value={formData.licenseType}
              onChange={handleChange}
              className="form-input"
              style={{ backgroundColor: 'white' }}
            >
              <option value={0}>Per User</option>
              <option value={1}>Per Device</option>
              <option value={2}>Concurrent</option>
              <option value={3}>Subscription</option>
            </select>
          </div>

          <div className="form-group">
            <label>Total Entitlements (Seats)</label>
            <input
              required
              type="number"
              min="1"
              name="totalEntitlements"
              value={formData.totalEntitlements}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Cost (₹)</label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Purchase Date</label>
            <input
              required
              type="date"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleChange}
              className={`form-input ${errors.purchaseDate ? 'error' : ''}`}
            />
            {/* Visual confirmation of the date format user requested */}
            <div className="date-hint">
              <Calendar size={12} />
              Selected: {formatDisplayDate(formData.purchaseDate)}
            </div>
            {errors.purchaseDate && (
              <span className="error-msg"><AlertCircle size={12}/> {errors.purchaseDate}</span>
            )}
          </div>

          <div className="form-group">
            <label>Expiry Date (Optional)</label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate || ''}
              onChange={handleChange}
              className={`form-input ${errors.expiryDate ? 'error' : ''}`}
            />
            {formData.expiryDate && (
              <div className="date-hint">
                <Calendar size={12} />
                Selected: {formatDisplayDate(formData.expiryDate)}
              </div>
            )}
            {errors.expiryDate && (
              <span className="error-msg"><AlertCircle size={12}/> {errors.expiryDate}</span>
            )}
          </div>
        </div>

        <div className="form-actions">
          <Link to="/inventory" className="btn btn-cancel">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="btn btn-submit">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {isEditing ? 'Update Software' : 'Save Software'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LicenseForm;