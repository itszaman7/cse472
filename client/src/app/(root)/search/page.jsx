"use client";

import RedditFeed from "@/components/RedditFeed";

// 💡 We no longer need useSearch here, as the URL is the source of truth.


// The page component automatically receives a `searchParams` prop
export default function SearchPage({ searchParams }) {
  // Read the query 'q' from the searchParams prop
  const query = searchParams.q || '';

  return (
    <main className="mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">
        Search Results for: <span className="text-blue-600">{query}</span>
      </h1>
      
      {/* The rest of the logic uses the 'query' variable from the URL */}
      {query ? (
        <RedditFeed subreddit={query} />
      ) : (
        <p className="text-gray-500">Please enter a search term in the header to see results.</p>
      )}
    </main>
  );
}