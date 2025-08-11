"use client";

export default function Leaderboard({ data }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="p-4 bg-white rounded-lg border">
      <h3 className="text-sm font-semibold mb-2">Top Contributors</h3>
      <ol className="text-sm text-gray-700 space-y-1">
        {data.map((u, idx) => (
          <li key={u._id || idx} className="flex justify-between">
            <span className="truncate mr-2">{u._id || "Anonymous"}</span>
            <span className="font-medium">{u.posts} posts</span>
          </li>
        ))}
      </ol>
    </div>
  );
}


