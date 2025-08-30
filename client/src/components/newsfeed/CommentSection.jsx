"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '@/context/UserContext'; // Assuming you have a user context
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Reply, Loader2, Bot, User, AlertTriangle } from 'lucide-react';

export default function CommentSection({ reportId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Get the current user from your context to know who is commenting
  const { user } = useUser(); 

  // 1. Fetch comments when the component loads
  useEffect(() => {
    const fetchComments = async () => {
      if (!reportId) return;
      
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://localhost:5000/posts/${reportId}`);
        // The comments are nested in the report object
        setComments(response.data.comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (err) {
        console.error("Failed to fetch comments:", err);
        setError("Could not load comments.");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [reportId]);


  // 2. Handle submitting a new comment
  const handleSubmitComment = async () => {

if (!newComment.trim() || !user) return;

 setSubmitting(true);

 try {
const response = await axios.post(`http://localhost:5000/posts/${reportId}/comments`, {

 // Your backend expects userName and comment

 userName: user.displayName || user.email, // Use display name or fallback to email

 comment: newComment,

});
// 3. Optimistic UI update: Add the new comment to the top of the list

 // The backend conveniently returns the new comment object

setComments(prevComments => [response.data.comment, ...prevComments]);
 setNewComment(''); // Clear the input field



 } catch (err) {

console.error("Failed to post comment:", err);

alert("Failed to post comment. Please try again.");

 } finally {

setSubmitting(false);

 }

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
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-900">Comments ({comments.length})</h4>
      
      {/* Comment Input */}
      <div className="space-y-2">
        <Textarea
          placeholder="Add a public comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[80px] resize-none"
          disabled={!user} // Disable if no user is logged in
        />
        <div className="flex justify-end">
          <Button 
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || submitting || !user}
            size="sm"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Post Comment
          </Button>
        </div>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-4">Loading comments...</div>
      ) : error ? (
        <div className="text-center py-4 text-red-500">{error}</div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="space-y-2">
              <div className="flex items-start space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs">
                    {comment.userName?.split(' ').map(n => n[0]).join('') || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm text-gray-900">
                      {comment.userName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">
                    {comment.comment}
                  </p>
                  
                  {/* AI Detection Badge */}
                  {comment.aiDetection && comment.aiDetection.success && comment.aiDetection.isAIGenerated && (
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="flex items-center space-x-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                        <Bot className="w-3 h-3" />
                        <span>AI Generated</span>
                        <span className="text-orange-600">
                          ({Math.round(comment.aiDetection.confidence * 100)}% confidence)
                        </span>
                      </div>
                      {comment.aiDetection.details?.aiGeneratedPercentage && (
                        <div className="text-xs text-gray-500">
                          {Math.round(comment.aiDetection.details.aiGeneratedPercentage * 100)}% of text appears AI-generated
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Deepfake Detection Badge */}
                  {comment.deepfakeDetection && comment.deepfakeDetection.success && comment.deepfakeDetection.anyFlagged && (
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Deepfake Detected</span>
                        <span className="text-red-600">
                          ({comment.deepfakeDetection.items.length} image{comment.deepfakeDetection.items.length !== 1 ? 's' : ''})
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Reply functionality can be implemented later */}
                  {/* <Button variant="ghost" size="sm" className="text-xs mt-1 h-6 px-2">
                    <Reply className="w-3 h-3 mr-1" />
                    Reply
                  </Button> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}