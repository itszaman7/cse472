"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '@/context/UserContext'; // Make sure you have user context
import { 
  Heart, 
  MessageCircle, 
  ThumbsUp, // Using ThumbsUp for "Helpful"
  MapPin, 
  Clock, 
  AlertTriangle,
  Shield,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CommentSection from './CommentSection';

export default function CrimeReportCard({ report }) {
  const { user } = useUser(); // Get the logged-in user

  // State to manage all reactions for this card
  const [reactions, setReactions] = useState(report.reactions || []);

  // Derived state to easily check the current user's reaction and counts
  const currentUserReaction = reactions.find(r => r.userName === user?.email)?.reactionType;
  const likeCount = reactions.filter(r => r.reactionType === '❤️').length;
  const helpfulCount = reactions.filter(r => r.reactionType === '👍').length;

  // This function handles all reaction clicks
  const handleReaction = async (reactionType) => {
    if (!user) {
      alert("Please log in to react.");
      return;
    }

    const reportId = report.id;
    const userName = user.email;
    let newReactions = [...reactions];

    if (currentUserReaction === reactionType) {
      // --- User is un-reacting ---
      // Optimistically update UI
      newReactions = reactions.filter(r => r.userName !== userName);
      setReactions(newReactions);
      
      try {
        // Send request to backend to remove the reaction
        await axios.delete(`http://localhost:5000/posts/${reportId}/reactions`, {
          data: { userName }
        });
      } catch (err) {
        console.error("Failed to remove reaction", err);
        setReactions(reactions); // Revert UI on failure
        alert("Failed to remove reaction.");
      }

    } else {
      // --- User is adding a new reaction or changing their reaction ---
      // Optimistically update UI
      const otherReactions = reactions.filter(r => r.userName !== userName);
      const newReaction = { userName, reactionType, createdAt: new Date() };
      newReactions = [...otherReactions, newReaction];
      setReactions(newReactions);

      try {
        // Send request to backend to add/update the reaction
        await axios.post(`http://localhost:5000/posts/${reportId}/reactions`, {
          userName,
          reactionType
        });
      } catch (err) {
        console.error("Failed to add reaction", err);
        setReactions(reactions); // Revert UI on failure
        alert("Failed to add reaction.");
      }
    }
  };


  const [showComments, setShowComments] = useState(false);

  const getThreatLevelColor = (level) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAuthenticityColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
          {/* ... Header remains the same ... */}
          <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="outline" className={getThreatLevelColor(report.threatLevel)}>
                <AlertTriangle className="w-3 h-3 mr-1" />
                {report.threatLevel.toUpperCase()}
              </Badge>
              <Badge variant="outline">
                {report.category}
              </Badge>
              {report.verified && (
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {report.title}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {report.location}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {formatTimestamp(report.timestamp)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-1" />
                <span className={`font-semibold ${getAuthenticityColor(report.authenticityScore)}`}>
                  {report.authenticityScore}%
                </span>
              </div>
              <p className="text-xs text-gray-500">Authenticity</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-gray-700 mb-4 leading-relaxed">
          {report.description}
        </p>

        {report.images && report.images.length > 0 && report.images[0].data && (
          <div className="mb-4">
            <img 
              src={report.images[0].data} 
              alt="Crime scene" 
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            {/* --- LIKE BUTTON (HEART) --- */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction('❤️')}
              className={`${currentUserReaction === '❤️' ? 'text-red-600' : 'text-gray-500'} hover:text-red-600`}
            >
              <Heart className={`w-4 h-4 mr-1 ${currentUserReaction === '❤️' ? 'fill-current' : ''}`} />
              {likeCount}
            </Button>
            
            {/* --- HELPFUL BUTTON (THUMBS UP) --- */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction('👍')}
              className={`${currentUserReaction === '👍' ? 'text-blue-600' : 'text-gray-500'} hover:text-blue-600`}
            >
              <ThumbsUp className={`w-4 h-4 mr-1 ${currentUserReaction === '👍' ? 'fill-current' : ''}`} />
              {helpfulCount}
            </Button>
            
            {/* --- COMMENT BUTTON --- */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="text-gray-500 hover:text-blue-600"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              {report.comments}
            </Button>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <span>Reported by {report.reportedBy}</span>
          </div>
        </div>

        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <CommentSection reportId={report.id} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}