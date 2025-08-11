"use client";

import { useState } from 'react';
import AddReportModal from '@/components/newsfeed/AddReportModal';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ReportPage() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If user is not authenticated, redirect to sign-in
    if (!user) {
      router.push('/sign-in');
    }
  }, [user, router]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    router.push('/');
  };

  if (!user) {
    return null; // Will redirect to sign-in
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AddReportModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        selectedCity="Dhaka"
      />
    </div>
  );
} 