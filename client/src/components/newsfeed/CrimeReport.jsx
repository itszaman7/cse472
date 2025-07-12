"use client";

import { useState } from 'react';
import axios from 'axios';
import { useUser } from '@/context/UserContext';
import { 
  Heart, 
  MessageCircle, 
  ThumbsUp,
  ThumbsDown,
  MapPin, 
  Clock, 
  AlertTriangle,
  Shield,
  CheckCircle,
  Smile, Frown, Meh
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CommentSection from './CommentSection';

const SentimentBadge = ({ sentiment }) => {
  if (!sentiment || sentiment === 'neutral') {
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
        <Meh className="w-3 h-3 mr-1" />
        Neutral Reactions
      </Badge>
    );
  }
  if (sentiment === 'positive') {
    return (
      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
        <Smile className="w-3 h-3 mr-1" />
        Positive Comment Section
      </Badge>
    );
  }
  if (sentiment === 'negative') {
    return (
      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
        <Frown className="w-3 h-3 mr-1" />
        Mostly Negative Comments
      </Badge>
    );
  }
  if (sentiment === 'mixed') {
    return (
      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
        <Meh className="w-3 h-3 mr-1" />
        Mixed Reactions
      </Badge>
    );
  }
  return null;
};

export default function CrimeReportCard({ report }) {
  const { user } = useUser();
  const [reactions, setReactions] = useState(report.reactions || []);
  const [showComments, setShowComments] = useState(false);

  const currentUserReaction = reactions.find(r => r.userName === user?.email)?.reactionType;
  const likeCount = reactions.filter(r => r.reactionType === '❤️').length;
  const helpfulCount = reactions.filter(r => r.reactionType === '👍').length;

  const handleReaction = async (reactionType) => {
    if (!user) {
      alert("Please log in to react.");
      return;
    }
    const reportId = report.id;
    const userName = user.email;
    let newReactions = [...reactions];

    if (currentUserReaction === reactionType) {
      newReactions = reactions.filter(r => r.userName !== userName);
      setReactions(newReactions);
      try {
        await axios.delete(`http://localhost:5000/posts/${reportId}/reactions`, { data: { userName } });
      } catch (err) {
        console.error("Failed to remove reaction", err);
        setReactions(reactions);
        alert("Failed to remove reaction.");
      }
    } else {
      const otherReactions = reactions.filter(r => r.userName !== userName);
      const newReaction = { userName, reactionType, createdAt: new Date() };
      newReactions = [...otherReactions, newReaction];
      setReactions(newReactions);
      try {
        await axios.post(`http://localhost:5000/posts/${reportId}/reactions`, { userName, reactionType });
      } catch (err) {
        console.error("Failed to add reaction", err);
        setReactions(reactions);
        alert("Failed to add reaction.");
      }
    }
  };

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
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center flex-wrap gap-2 mb-2">
              <Badge variant="outline" className={getThreatLevelColor(report.threatLevel)}>
                <AlertTriangle className="w-3 h-3 mr-1" />
                {report.threatLevel.toUpperCase()}
              </Badge>
              <SentimentBadge sentiment={report.sentiment?.overall} />
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

        {/* --- THIS IS THE MODIFIED SECTION --- */}
        {report.attachments && report.attachments.length > 0 && (
          <div className="mb-4 rounded-lg overflow-hidden bg-gray-100">
            {report.attachments[0].file_type === 'image' ? (
              <img 
                src={report.attachments[0].url} 
                alt={report.title} 
                className="w-full h-auto max-h-96 object-contain"
              />
            ) : report.attachments[0].file_type === 'video' ? (
              <video 
                src={report.attachments[0].url} 
                className="w-full h-auto max-h-96"
                controls
              />
            ) : null}
          </div>
        )}
        {/* --- END OF MODIFICATION --- */}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost" size="sm" onClick={() => handleReaction('❤️')}
              className={`${currentUserReaction === '❤️' ? 'text-red-600' : 'text-gray-500'} hover:text-red-600`}
            >
              <ThumbsUp className={`w-4 h-4 mr-1 ${currentUserReaction === '❤️' ? 'fill-current' : ''}`} />
              {likeCount}
            </Button>
            
            <Button
              variant="ghost" size="sm" onClick={() => handleReaction('👍')}
              className={`${currentUserReaction === '👍' ? 'text-blue-600' : 'text-gray-500'} hover:text-blue-600`}
            >
              <ThumbsDown className={`w-4 h-4 mr-1 ${currentUserReaction === '👍' ? 'fill-current' : ''}`} />
              {helpfulCount}
            </Button>
            
            <Button
              variant="ghost" size="sm" onClick={() => setShowComments(!showComments)}
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