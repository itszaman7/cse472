"use client";

import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapPin, Camera, AlertTriangle, X, Upload } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import Swal from 'sweetalert2';

export default function AddReportModal({ isOpen, onClose, selectedCity }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: '',
    threatLevel: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const { user, status } = useUser();

  const categories = [
    'Theft',
    'Violence',
    'Vandalism',
    'Suspicious Activity',
    'Drug Activity',
    'Noise Complaint',
    'Other'
  ];

  const threatLevels = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const maxFiles = 5;
    const maxSize = 5 * 1024 * 1024; // 5MB per file
    
    if (selectedFiles.length + files.length > maxFiles) {
      Swal.fire({
        icon: 'warning',
        title: 'Too Many Files',
        text: `You can only upload up to ${maxFiles} files.`,
        confirmButtonColor: '#dc2626'
      });
      return;
    }

    // Validate file types and sizes
    const validFiles = [];
    const invalidFiles = [];

    files.forEach(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= maxSize;

      if (isValidType && isValidSize) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Files',
        text: `The following files are invalid: ${invalidFiles.join(', ')}. Please ensure files are images/videos and under 5MB.`,
        confirmButtonColor: '#dc2626'
      });
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      
      // Create preview URLs
      const newPreviewUrls = validFiles.map(file => ({
        file: file,
        url: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? 'image' : 'video'
      }));
      
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  // Remove file from selection
  const removeFile = (index) => {
    // Revoke the object URL to free memory
    URL.revokeObjectURL(previewUrls[index].url);
    
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Convert files to base64 for storage
  const convertFilesToBase64 = async (files) => {
    const promises = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            name: file.name,
            type: file.type,
            size: file.size,
            data: reader.result
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });
    
    return Promise.all(promises);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert files to base64 if any are selected
      let attachments = [];
      if (selectedFiles.length > 0) {
        attachments = await convertFilesToBase64(selectedFiles);
      }

      const reportData = {
        ...formData,
        userEmail: user ? user.email : 'anonymous',
        city: selectedCity,
        status: 'pending',
        attachments: attachments
      };

      const response = await axios.post('http://localhost:5000/posts', reportData);
      
      // Success alert
      await Swal.fire({
        icon: 'success',
        title: 'Report Submitted Successfully!',
        text: 'Your incident report has been submitted and is now under review.',
        confirmButtonColor: '#10b981',
        timer: 3000,
        showConfirmButton: true
      });

      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        location: '',
        category: '',
        threatLevel: ''
      });
      setSelectedFiles([]);
      setPreviewUrls([]);
      onClose();

    } catch (error) {
      console.error('Error submitting report:', error);
      
      // Error alert
      await Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: error.response?.data?.message || 'An error occurred while submitting your report. Please try again.',
        confirmButtonColor: '#dc2626'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Clean up preview URLs when component unmounts
  useState(() => {
    return () => {
      previewUrls.forEach(preview => URL.revokeObjectURL(preview.url));
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
            Report New Incident
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Incident Title</Label>
              <Input
                id="title"
                placeholder="Brief description of the incident"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select required value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide detailed information about what happened..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="location"
                  placeholder="Specific address or landmark"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="threatLevel">Threat Level</Label>
              <Select required value={formData.threatLevel} onValueChange={(value) => handleInputChange('threatLevel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select threat level" />
                </SelectTrigger>
                <SelectContent>
                  {threatLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Attachments</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Upload photos or videos (optional)
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Max 5 files, 5MB each. Supported: JPG, PNG, GIF, MP4, MOV
              </p>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Button type="button" variant="outline" onClick={() => document.getElementById('file-upload').click()}>
                <Camera className="w-4 h-4 mr-2" />
                Choose Files
              </Button>
            </div>

            {/* File previews */}
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {previewUrls.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      {preview.type === 'image' ? (
                        <img
                          src={preview.url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={preview.url}
                          className="w-full h-full object-cover"
                          controls
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      {selectedFiles[index]?.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}