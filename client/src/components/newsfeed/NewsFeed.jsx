"use client";

import { useState, useEffect } from 'react';
import CrimeReportCard from './CrimeReport';
import { Loader2 } from 'lucide-react';

export default function NewsFeed({ selectedCity, filterType }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  const mockReports = [
    {
      id: '1',
      title: 'Break-in reported on 5th Avenue',
      description: 'Witnessed suspicious activity around 2 AM. Someone broke into the jewelry store on 5th Avenue. Police arrived 15 minutes later.',
      location: '5th Avenue, Manhattan',
      timestamp: '2024-01-15T02:30:00Z',
      category: 'Theft',
      threatLevel: 'high',
      authenticityScore: 92,
      reportedBy: 'John D.',
      likes: 24,
      comments: 8,
      helps: 3,
      verified: true,
      images: ['https://images.pexels.com/photos/257881/pexels-photo-257881.jpeg?auto=compress&cs=tinysrgb&w=400']
    },
    {
      id: '2',
      title: 'Assault incident near Central Park',
      description: 'A person was attacked while jogging in Central Park around 6 PM. The victim was taken to the hospital and is in stable condition.',
      location: 'Central Park, NYC',
      timestamp: '2024-01-15T18:00:00Z',
      category: 'Violence',
      threatLevel: 'critical',
      authenticityScore: 88,
      reportedBy: 'Sarah M.',
      likes: 45,
      comments: 12,
      helps: 7,
      verified: true
    },
    {
      id: '3',
      title: 'Vandalism in Brooklyn neighborhood',
      description: 'Multiple cars were vandalized overnight. Graffiti and broken windows reported on several vehicles in the area.',
      location: 'Brooklyn Heights, Brooklyn',
      timestamp: '2024-01-15T08:00:00Z',
      category: 'Vandalism',
      threatLevel: 'medium',
      authenticityScore: 76,
      reportedBy: 'Mike R.',
      likes: 18,
      comments: 5,
      helps: 2,
      verified: false
    },
    {
      id: '4',
      title: 'Suspicious vehicle reported',
      description: 'A van with no license plates has been parked in the same spot for 3 days. Residents are concerned about potential illegal activity.',
      location: 'Queens Boulevard, Queens',
      timestamp: '2024-01-15T14:30:00Z',
      category: 'Suspicious Activity',
      threatLevel: 'low',
      authenticityScore: 64,
      reportedBy: 'Lisa K.',
      likes: 12,
      comments: 3,
      helps: 1,
      verified: false
    }
  ];

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      let filteredReports = mockReports;
      
      if (filterType !== 'all') {
        filteredReports = mockReports.filter(report => 
          report.category.toLowerCase() === filterType.toLowerCase()
        );
      }
      
      setReports(filteredReports);
      setLoading(false);
    }, 1000);
  }, [selectedCity, filterType]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading crime reports...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Crime Reports - {selectedCity}
        </h2>
        <p className="text-sm text-gray-500">
          {reports.length} reports found
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No crime reports found for the selected filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <CrimeReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}