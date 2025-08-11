"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import CrimeReportCard from "@/components/newsfeed/CrimeReport";

export default function SearchPage() {
  const sp = useSearchParams();
  const query = sp.get("q") || "";
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!query) return;
      setLoading(true);
      setError("");
      try {
        const categoryMatch = query.toLowerCase().startsWith("c/") ? query.slice(2) : null;
        const params = categoryMatch ? { category: categoryMatch } : { q: query };
        params.limit = 50;
        const res = await axios.get("http://localhost:5000/posts", { params });
        const fetched = res.data.reports || [];
        const formatted = fetched.map((report) => ({
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
          verified: report.status === 'verified' || report.verified === true,
          attachments: report.attachments || [],
          reactions: report.reactions || [],
          sentiment: report.sentiment || { overall: 'neutral' },
          aiAnalysis: report.aiAnalysis || null,
        }));
        setReports(formatted);
      } catch (e) {
        setError("Could not load posts.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [query]);

  return (
    <main className="mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">
        Search Results for: <span className="text-blue-600">{query}</span>
      </h1>
      {!query && <p className="text-gray-500">Please enter a search term in the header to see results.</p>}
      {loading && <div className="text-gray-500">Loading...</div>}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {!loading && !error && query && (
        reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map((r) => (
              <CrimeReportCard key={r.id} report={r} />
            ))}
          </div>
        ) : (
          <div className="text-gray-500">No posts matched.</div>
        )
      )}
    </main>
  );
}