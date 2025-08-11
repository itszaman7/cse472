"use client";

import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function TestProfile() {
  const { user, status } = useUser();
  const router = useRouter();

  useEffect(() => {
    console.log('Test profile page - status:', status, 'user:', user);
  }, [user, status]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Profile Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> {status}</p>
            <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}</p>
            <p><strong>User Email:</strong> {user?.email || 'No email'}</p>
            <p><strong>User Name:</strong> {user?.name || 'No name'}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 