"use client";

import { useState, useEffect } from 'react';
import { 
  Play, 
  Square, 
  RefreshCw, 
  FileText, 
  Globe, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Brain,
  Database,
  TrendingUp,
  Settings,
  Eye,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import axios from 'axios';

export default function NewsCrawler() {
  const [crawlStatus, setCrawlStatus] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [selectedSource, setSelectedSource] = useState('all');
  const [crawlLimit, setCrawlLimit] = useState(3);
  const [enableAI, setEnableAI] = useState(true);
  const [crawlHistory, setCrawlHistory] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [createdPosts, setCreatedPosts] = useState([]);
  const [showCreatedPosts, setShowCreatedPosts] = useState(false);

  const newsSources = [
    { name: 'all', label: 'All Sources' },
    { name: 'Prothom Alo', label: 'Prothom Alo' },
    { name: 'BDNews24 Bangla', label: 'BDNews24 Bangla' },
    { name: 'Kaler Kantho', label: 'Kaler Kantho' },
    { name: 'Jugantor', label: 'Jugantor' },
    { name: 'Samakal', label: 'Samakal' },
    { name: 'Ittefaq', label: 'Ittefaq' },
    { name: 'The Daily Star', label: 'The Daily Star' },
    { name: 'Dhaka Tribune', label: 'Dhaka Tribune' },
    { name: 'The Business Standard', label: 'The Business Standard' },
    { name: 'New Age', label: 'New Age' }
  ];

  // Fetch crawl status periodically
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/crawler/status`);
        setCrawlStatus(response.data);
        
        // Check if crawler is running based on multiple indicators
        const running = response.data.isRunning || 
                       (response.data.startedAt && !response.data.stopRequested);
        
        // If we were stopping and now it's not running, we're done stopping
        if (isStopping && !running) {
          setIsStopping(false);
        }
        
        setIsRunning(running);
      } catch (error) {
        console.error('Failed to fetch crawl status:', error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, [isStopping]);

  // Fetch crawl history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/crawler/history`);
        setCrawlHistory(response.data.history || []);
      } catch (error) {
        console.error('Failed to fetch crawl history:', error);
      }
    };

    fetchHistory();
  }, []);

  // Warn user before leaving if crawler is stopping
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isStopping) {
        e.preventDefault();
        e.returnValue = 'The crawler is currently stopping. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isStopping]);

  const startCrawl = async () => {
    try {
      setIsRunning(true);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/crawler/start`, {
        source: selectedSource === 'all' ? null : selectedSource,
        limit: crawlLimit,
        ai: enableAI
      });
      
      if (response.data.success) {
        console.log('Crawl started successfully');
      }
    } catch (error) {
      console.error('Failed to start crawl:', error);
      setIsRunning(false);
    }
  };

  const stopCrawl = async () => {
    try {
      setIsStopping(true);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/crawler/stop`);
      if (response.data.success) {
        console.log('Stop request sent successfully');
        // Don't set isRunning to false immediately - let the status check handle it
      }
    } catch (error) {
      console.error('Failed to stop crawl:', error);
      setIsStopping(false);
    }
  };

  const forceStopCrawl = async () => {
    try {
      setIsStopping(true);
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/crawler/stop`);
      setCrawlStatus(null);
      console.log('Force stopped crawl');
      // Let the status check handle the running state
    } catch (error) {
      console.error('Failed to force stop crawl:', error);
      setIsStopping(false);
    }
  };

  const viewCreatedPosts = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/posts?category=News&limit=20`);
      setCreatedPosts(response.data.reports || []);
      setShowCreatedPosts(true);
    } catch (error) {
      console.error('Failed to fetch created posts:', error);
    }
  };

  const previewCrawl = async () => {
    try {
      setShowPreview(true);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/crawler/preview`, {
        source: selectedSource === 'all' ? null : selectedSource,
        limit: crawlLimit
      });
      
      setPreviewData(response.data);
    } catch (error) {
      console.error('Failed to preview crawl:', error);
      setShowPreview(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'text-green-600';
      case 'stopped': return 'text-red-600';
      case 'completed': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'stopped': return <Square className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDuration = (startTime) => {
    if (!startTime) return 'N/A';
    const start = new Date(startTime);
    const now = new Date();
    const diff = now - start;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">News Crawler</h1>
          <p className="text-gray-600 mt-2">
            Automatically crawl news articles and convert them to AI-analyzed posts
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge 
            variant={isStopping ? "destructive" : isRunning ? "default" : "secondary"}
            className={isStopping ? "animate-pulse" : ""}
          >
            {isStopping ? "Stopping..." : isRunning ? "Running" : "Stopped"}
          </Badge>
        </div>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            Crawl Control
          </CardTitle>
        </CardHeader>
        {isStopping && (
          <div className="mx-6 mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center text-yellow-800">
              <AlertTriangle className="w-4 h-4 mr-2" />
              <span className="font-medium">Stopping Crawler...</span>
            </div>
            <p className="text-yellow-700 text-sm mt-1">
              Please wait while the crawler safely stops. This may take a few moments to complete.
            </p>
          </div>
        )}
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="source">News Source</Label>
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {newsSources.map(source => (
                    <SelectItem key={source.name} value={source.name}>
                      {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="limit">Articles per Source</Label>
              <Select value={crawlLimit.toString()} onValueChange={(value) => setCrawlLimit(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="ai-mode"
                checked={enableAI}
                onCheckedChange={setEnableAI}
              />
              <Label htmlFor="ai-mode">Enable AI Analysis</Label>
            </div>
            
                         <div className="flex items-end space-x-2">
               <Button
                 onClick={previewCrawl}
                 variant="outline"
                 disabled={isRunning || isStopping}
                 className="flex-1"
               >
                 <Eye className="w-4 h-4 mr-2" />
                 Preview
               </Button>
               <Button
                 onClick={viewCreatedPosts}
                 variant="outline"
                 disabled={isStopping}
                 className="flex-1"
               >
                 <FileText className="w-4 h-4 mr-2" />
                 View Posts
               </Button>
             </div>
          </div>
          
          <Separator />
          
                     <div className="flex items-center space-x-4">
             <Button
               onClick={startCrawl}
               disabled={isRunning || isStopping}
               className="bg-green-600 hover:bg-green-700"
             >
               <Play className="w-4 h-4 mr-2" />
               Start Crawl
             </Button>
             
             <Button
               onClick={stopCrawl}
               disabled={!isRunning || isStopping}
               variant="destructive"
             >
               <Square className="w-4 h-4 mr-2" />
               {isStopping ? (
                 <>
                   <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                   Stopping...
                 </>
               ) : (
                 <>
                   <Square className="w-4 h-4 mr-2" />
                   Stop Crawl
                 </>
               )}
             </Button>

             <Button
               onClick={forceStopCrawl}
               variant="outline"
               disabled={isStopping}
               className="border-red-300 text-red-700 hover:bg-red-50"
             >
               <AlertTriangle className="w-4 h-4 mr-2" />
               {isStopping ? "Stopping..." : "Force Stop"}
             </Button>
           </div>
        </CardContent>
      </Card>

      {/* Current Status */}
      {crawlStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <RefreshCw className="w-4 h-4 mr-2" />
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {crawlStatus.builtCount || 0}
                </div>
                <div className="text-sm text-gray-600">Articles Built</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {crawlStatus.insertedCount || 0}
                </div>
                <div className="text-sm text-gray-600">Posts Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {crawlStatus.skippedCount || 0}
                </div>
                <div className="text-sm text-gray-600">Skipped</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {crawlStatus.startedAt ? formatDuration(crawlStatus.startedAt) : 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Duration</div>
              </div>
            </div>
            
            {crawlStatus.lastError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center text-red-800">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  <span className="font-medium">Last Error:</span>
                </div>
                <p className="text-red-700 text-sm mt-1">{crawlStatus.lastError}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Preview Results */}
      {showPreview && previewData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                Preview Results
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(false)}
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {previewData.debugReport?.map((source, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{source.source}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{source.extracted} extracted</Badge>
                      <Badge variant="outline">{source.built} built</Badge>
                    </div>
                  </div>
                  {source.error && (
                    <p className="text-red-600 text-sm">{source.error}</p>
                  )}
                  {source.sampleUrls.length > 0 && (
                    <div className="text-sm text-gray-600">
                      <div className="font-medium mb-1">Sample URLs:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {source.sampleUrls.slice(0, 3).map((url, urlIndex) => (
                          <li key={urlIndex} className="truncate">
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
              
              {previewData.items && previewData.items.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Sample Articles ({previewData.items.length})</h4>
                  <div className="space-y-2">
                    {previewData.items.slice(0, 5).map((item, index) => (
                      <div key={index} className="border rounded p-3">
                        <h5 className="font-medium text-sm">{item.title}</h5>
                        <p className="text-xs text-gray-600 mt-1">{item.source}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.contentText}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

             {/* Created Posts */}
       {showCreatedPosts && (
         <Card>
           <CardHeader>
             <CardTitle className="flex items-center justify-between">
               <div className="flex items-center">
                 <FileText className="w-5 h-5 mr-2" />
                 Created Posts ({createdPosts.length})
               </div>
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => setShowCreatedPosts(false)}
               >
                 <XCircle className="w-4 h-4" />
               </Button>
             </CardTitle>
           </CardHeader>
           <CardContent>
             {createdPosts.length === 0 ? (
               <div className="text-center py-8 text-gray-500">
                 <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                 <p>No news posts created yet</p>
               </div>
             ) : (
               <div className="space-y-3">
                 {createdPosts.map((post, index) => (
                   <div key={index} className="border rounded-lg p-4">
                     <div className="flex items-start justify-between">
                       <div className="flex-1">
                         <h4 className="font-medium text-sm mb-1">{post.title}</h4>
                         <p className="text-xs text-gray-600 mb-2">{post.source}</p>
                         <p className="text-xs text-gray-500 line-clamp-2">{post.description}</p>
                         <div className="flex items-center space-x-2 mt-2">
                           <Badge variant="outline" className="text-xs">
                             {post.category}
                           </Badge>
                           <Badge variant="outline" className="text-xs">
                             {post.threatLevel}
                           </Badge>
                           {post.importMeta?.aiEnabled && (
                             <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                               AI Analyzed
                             </Badge>
                           )}
                         </div>
                       </div>
                       <div className="text-right text-xs text-gray-500">
                         {new Date(post.createdAt).toLocaleDateString()}
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </CardContent>
         </Card>
       )}

       {/* Crawl History */}
       <Card>
         <CardHeader>
           <CardTitle className="flex items-center">
             <Database className="w-5 h-5 mr-2" />
             Crawl History
           </CardTitle>
         </CardHeader>
        <CardContent>
          {crawlHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No crawl history available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {crawlHistory.slice(0, 10).map((crawl, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(crawl.status)}
                    <div>
                      <div className="font-medium">{crawl.source || 'All Sources'}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(crawl.startedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-medium">{crawl.insertedCount} posts</div>
                      <div className="text-sm text-gray-600">{crawl.duration}</div>
                    </div>
                    <Badge variant={crawl.status === 'completed' ? 'default' : 'secondary'}>
                      {crawl.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-full bg-blue-100">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {crawlHistory.reduce((sum, crawl) => sum + crawl.insertedCount, 0)}
                </p>
                <p className="text-sm text-gray-600">Total Posts Created</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-full bg-green-100">
                <Brain className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {crawlHistory.filter(crawl => crawl.status === 'completed').length}
                </p>
                <p className="text-sm text-gray-600">Successful Crawls</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-full bg-purple-100">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {crawlHistory.length}
                </p>
                <p className="text-sm text-gray-600">Total Crawl Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
