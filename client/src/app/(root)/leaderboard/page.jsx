"use client";

import { useEffect, useState } from "react";

export default function LeaderboardPage() {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch("http://localhost:5000/posts?limit=1")
      .then((r) => r.json())
      .then((d) => setData(d.leaderboard || []))
      .catch(() => setData([]));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Top Contributors</h1>
        <p className="text-gray-500">Most active reporters and helpers this week</p>
      </div>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-700">
              <th className="text-left px-5 py-3">Rank</th>
              <th className="text-left px-5 py-3">User</th>
              <th className="text-right px-5 py-3">Posts</th>
            </tr>
          </thead>
          <tbody>
            {data.map((u, idx) => (
              <tr key={idx} className="border-t hover:bg-gray-50">
                <td className="px-5 py-3 font-semibold text-gray-700">#{idx + 1}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${idx===0?'bg-yellow-500':idx===1?'bg-gray-400':idx===2?'bg-amber-700':'bg-blue-600'}`}>
                      {(u._id || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{u._id || 'anonymous'}</div>
                      <div className="text-xs text-gray-500">Reporter</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-right font-semibold">{u.posts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


