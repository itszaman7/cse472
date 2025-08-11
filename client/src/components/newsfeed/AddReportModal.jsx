"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Camera, AlertTriangle, X, Upload, FileImage, Video } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import Swal from 'sweetalert2';
import OpenStreetMapLocationSelector from './OpenStreetMapLocationSelector';
import SimpleMapViewer from './SimpleMapViewer';

export default function AddReportModal({ isOpen, onClose, selectedCity }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: '',
    threatLevel: ''
  });
  const [selectedLocationData, setSelectedLocationData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const { user } = useUser();

  const categories = [
    'Theft', 'Violence', 'Vandalism', 'Suspicious Activity',
    'Drug Activity', 'Noise Complaint', 'Other'
  ];
  const threatLevels = [
    { value: 'low', label: 'Low', color: 'text-green-600' }, 
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' }, 
    { value: 'critical', label: 'Critical', color: 'text-red-600' }
  ];

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const maxFiles = 5;
    const maxSize = 10 * 1024 * 1024; // 10MB per file

    if (selectedFiles.length + files.length > maxFiles) {
      Swal.fire({
        icon: 'warning',
        title: 'Too Many Files',
        text: `You can only upload up to ${maxFiles} files.`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        background: '#1f2937',
        color: '#f3f4f6',
        iconColor: '#f59e0b'
      });
      return;
    }

    const validFiles = [];
    const invalidFiles = [];
    files.forEach(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= maxSize;
      if (isValidType && isValidSize) validFiles.push(file);
      else invalidFiles.push(file.name);
    });

    if (invalidFiles.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Files',
        text: `The following files are invalid: ${invalidFiles.join(', ')}. Please ensure files are under 10MB.`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: '#1f2937',
        color: '#f3f4f6',
        iconColor: '#ef4444'
      });
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      const newPreviewUrls = validFiles.map(file => ({
        url: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? 'image' : 'video'
      }));
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removeFile = (index) => {
    URL.revokeObjectURL(previewUrls[index].url);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    data.append('userEmail', user ? user.email : 'anonymous');
    data.append('city', selectedCity);
    data.append('status', 'pending');
    selectedFiles.forEach(file => data.append('attachments', file));

    try {
      await axios.post('http://localhost:5000/posts', data);
      
      await Swal.fire({
        icon: 'success',
        title: 'Report Submitted!',
        text: 'Your report is now under review.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        background: '#1f2937',
        color: '#f3f4f6',
        iconColor: '#10b981'
      });

      setFormData({ title: '', description: '', location: '', category: '', threatLevel: '' });
      setSelectedFiles([]);
      setPreviewUrls([]);
      onClose();

    } catch (error) {
      console.error('Error submitting report:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: error.response?.data?.message || 'An error occurred. Please try again.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: '#1f2937',
        color: '#f3f4f6',
        iconColor: '#ef4444'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    return () => {
      previewUrls.forEach(preview => URL.revokeObjectURL(preview.url));
    };
  }, [previewUrls]);

  const getThreatLevelColor = (level) => {
    const found = threatLevels.find(t => t.value === level);
    return found ? found.color : 'text-gray-600';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-2xl lg:max-w-3xl max-h-[92vh] overflow-y-auto bg-white border-0 shadow-2xl rounded-2xl p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 sticky top-0 z-10 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75 border-b">
          <DialogTitle className="flex items-center text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
            <div className="p-2 rounded-full bg-red-100 mr-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            Report New Incident
          </DialogTitle>
          <p className="text-gray-600 mt-1">Help keep your community safe by reporting incidents</p>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-5">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="title" className="text-sm font-semibold text-gray-700 flex items-center">
                  Incident Title
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input 
                  id="title" 
                  placeholder="Brief description of the incident" 
                  value={formData.title} 
                  onChange={(e) => handleInputChange('title', e.target.value)} 
                  required 
                  className="border-2 border-gray-200 focus:border-red-400 focus:ring-red-100 rounded-lg transition-all duration-200 hover:border-gray-300"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="category" className="text-sm font-semibold text-gray-700 flex items-center">
                  Category
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select required value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className="border-2 border-gray-200 focus:border-red-400 focus:ring-red-100 rounded-lg transition-all duration-200 hover:border-gray-300">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-2 shadow-lg">
                    {categories.map((category) => (
                      <SelectItem key={category} value={category} className="rounded-md hover:bg-red-50 focus:bg-red-50">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700 flex items-center">
                Description
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Textarea 
                id="description" 
                placeholder="Provide detailed information about what happened, when, and any other relevant details..." 
                value={formData.description} 
                onChange={(e) => handleInputChange('description', e.target.value)} 
                className="min-h-[120px] border-2 border-gray-200 focus:border-red-400 focus:ring-red-100 rounded-lg transition-all duration-200 hover:border-gray-300 resize-none" 
                required 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="location" className="text-sm font-semibold text-gray-700 flex items-center">
                  Location
                  <span className="text-red-500 ml-1">*</span>
                </Label>
              <OpenStreetMapLocationSelector 
                selectedLocation={typeof formData.location === 'object' ? formData.location.label : formData.location}
                onLocationChange={(loc) => {
                  // loc is { label, latitude, longitude }
                  handleInputChange('location', loc);
                }}
              />
              </div>
              <div className="space-y-3">
                <Label htmlFor="threatLevel" className="text-sm font-semibold text-gray-700 flex items-center">
                  Threat Level
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select required value={formData.threatLevel} onValueChange={(value) => handleInputChange('threatLevel', value)}>
                  <SelectTrigger className="border-2 border-gray-200 focus:border-red-400 focus:ring-red-100 rounded-lg transition-all duration-200 hover:border-gray-300">
                    <SelectValue placeholder="Select threat level" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-2 shadow-lg">
                    {threatLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value} className="rounded-md hover:bg-red-50 focus:bg-red-50">
                        <span className={`font-medium ${level.color}`}>{level.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Map Viewer */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">Location Details</Label>
              <div className="rounded-lg overflow-hidden border">
                <SimpleMapViewer location={formData.location} />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-semibold text-gray-700">Attachments</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gradient-to-br from-gray-50 to-white hover:border-red-300 transition-all duration-300 hover:bg-gradient-to-br hover:from-red-50 hover:to-white">
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 rounded-full bg-gradient-to-r from-red-100 to-red-200">
                    <Upload className="w-8 h-8 text-red-600" />
                  </div>
                  <div>
                    <p className="text-base sm:text-lg font-medium text-gray-700 mb-1">Upload Evidence</p>
                    <p className="text-xs sm:text-sm text-gray-500">Max 5 files, 10MB each • Images & Videos supported</p>
                  </div>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*,video/*" 
                    onChange={handleFileSelect} 
                    className="hidden" 
                    id="file-upload" 
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => document.getElementById('file-upload').click()}
                    className="bg-white hover:bg-red-50 border-red-200 text-red-600 hover:text-red-700 hover:border-red-300 transition-all duration-200"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Choose Files
                  </Button>
                </div>
              </div>
              {previewUrls.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <FileImage className="w-4 h-4 mr-2" />
                    Selected Files ({previewUrls.length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {previewUrls.map((preview, index) => (
                      <div key={preview.url} className="relative group">
                        <div className="aspect-square rounded-xl overflow-hidden bg-white shadow-md hover:shadow-lg transition-all duration-200 border-2 border-gray-100">
                          {preview.type === 'image' ? (
                            <img 
                              src={preview.url} 
                              alt={`Preview ${index + 1}`} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 group-hover:bg-gray-200 transition-colors duration-200">
                              <Video className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeFile(index)} 
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-gray-200 sticky bottom-0 bg-white pb-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                disabled={isSubmitting}
                className="px-6 py-2 hover:bg-gray-50 border-gray-300 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="px-8 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Submit Report
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}