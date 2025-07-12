"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import CrimeReportCard from './CrimeReport';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NewsFeed({ selectedCity, filterType }) {
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setReports([]);
    setPage(1);
    setPagination(null);
  }, [selectedCity, filterType]);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = {
          city: selectedCity,
          page: page,
          limit: 5
        };

        if (filterType && filterType.toLowerCase() !== 'all') {
          params.category = filterType;
        }

        const response = await axios.get('http://localhost:5000/posts', { params });
        
        const { reports: fetchedReports, pagination: paginationData } = response.data;
        
        // Map the database fields to the props your CrimeReportCard component expects
        const formattedReports = fetchedReports.map(report => ({
          id: report._id,
          title: report.title,
          description: report.description,
          location: report.location,
          timestamp: report.createdAt,
          category: report.category,
          threatLevel: report.threatLevel,
          authenticityScore: report.authenticityLevel || 0,
          reportedBy: report.userEmail,
          comments: report.comments?.length || 0,
          verified: report.status === 'verified',
          images: report.attachments || [],
          reactions: report.reactions || [],
          sentiment: report.sentiment || { overall: 'neutral' }
        }));

        setReports(prev => page === 1 ? formattedReports : [...prev, ...formattedReports]);
        setPagination(paginationData);

      } catch (err) {
        console.error("Failed to fetch crime reports:", err);
        setError("Could not load reports. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [page, selectedCity, filterType]);

  const handleLoadMore = () => {
    if (pagination && pagination.hasNext) {
      setPage(prevPage => prevPage + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Crime Reports - {selectedCity}
        </h2>
        {pagination && (
          <p className="text-sm text-gray-500">
            {pagination.totalReports} reports found
          </p>
        )}
      </div>

      {error && <div className="text-center py-12 text-red-600">{error}</div>}

      {loading && page === 1 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading crime reports...</span>
        </div>
      ) : reports.length === 0 && !loading ? (
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

      <div className="text-center">
        {loading && page > 1 && (
            <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
        )}
        {!loading && pagination && pagination.hasNext && (
          <Button onClick={handleLoadMore} variant="outline">
            Load More
          </Button>
        )}
      </div>
    </div>
  );
}