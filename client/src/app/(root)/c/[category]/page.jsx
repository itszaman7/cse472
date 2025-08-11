"use client";

import { useParams } from "next/navigation";
import NewsFeed from "@/components/newsfeed/NewsFeed";
import { useMemo } from "react";

export default function CategoryFeedPage() {
  const params = useParams();
  const category = useMemo(() => {
    const raw = Array.isArray(params?.category) ? params.category[0] : params?.category;
    return raw ? decodeURIComponent(raw) : '';
  }, [params]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">c/{category}</h1>
        <NewsFeed selectedCity={"Dhaka"} filterType={category} />
      </div>
    </div>
  );
}


