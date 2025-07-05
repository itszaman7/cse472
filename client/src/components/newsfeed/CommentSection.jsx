"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Reply } from 'lucide-react';

export default function CommentSection({ reportId }) {
  const [comments, setComments] = useState([
    {
      id: '1',
      author: 'Alex Johnson',
      content: 'I live nearby and can confirm this happened. Police were there for hours.',
      timestamp: '2024-01-15T10:30:00Z',
      replies: [
        {
          id: '2',
          author: 'Maria Garcia',
          content: 'Thanks for the confirmation. Did you see which direction they went?',
          timestamp: '2024-01-15T11:00:00Z'
        }
      ]
    },
    {
      id: '3',
      author: 'David Chen',
      content: 'This is concerning. We need more patrol in this area.',
      timestamp: '2024-01-15T12:15:00Z'
    }
  ]);
  
  const [newComment, setNewComment] = useState('');

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now().toString(),
        author: 'Current User',
        content: newComment,
        timestamp: new Date().toISOString()
      };
      
      setComments([...comments, comment]);
      setNewComment('');
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
      <h4 className="font-semibold text-gray-900">Comments</h4>
      
      {/* Comment Input */}
      <div className="space-y-2">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[80px] resize-none"
        />
        <div className="flex justify-end">
          <Button 
            onClick={handleSubmitComment}
            disabled={!newComment.trim()}
            size="sm"
          >
            <Send className="w-4 h-4 mr-2" />
            Post Comment
          </Button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="space-y-2">
            <div className="flex items-start space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs">
                  {comment.author.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm text-gray-900">
                    {comment.author}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(comment.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-1">
                  {comment.content}
                </p>
                <Button variant="ghost" size="sm" className="text-xs mt-1 h-6 px-2">
                  <Reply className="w-3 h-3 mr-1" />
                  Reply
                </Button>
              </div>
            </div>
            
            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-11 space-y-2">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="flex items-start space-x-3">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">
                        {reply.author.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm text-gray-900">
                          {reply.author}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(reply.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">
                        {reply.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}