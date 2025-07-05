"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Play, 
  Pause, 
  RefreshCw, 
  Settings, 
  TrendingUp,
  Database,
  Cpu,
  Activity
} from 'lucide-react';

export default function AIModelManagement() {
  const [models, setModels] = useState([
    {
      id: 'authenticity-v2',
      name: 'Authenticity Detector v2.0',
      type: 'Classification',
      status: 'active',
      accuracy: 94.2,
      lastTrained: '2024-01-10',
      version: '2.0.1',
      trainingData: '50K reports',
      performance: 'excellent'
    },
    {
      id: 'threat-assessment',
      name: 'Threat Level Assessment',
      type: 'Regression',
      status: 'active',
      accuracy: 89.7,
      lastTrained: '2024-01-08',
      version: '1.5.3',
      trainingData: '35K reports',
      performance: 'good'
    },
    {
      id: 'content-analysis',
      name: 'Content Analysis Engine',
      type: 'NLP',
      status: 'training',
      accuracy: 87.3,
      lastTrained: '2024-01-12',
      version: '1.2.0',
      trainingData: '75K reports',
      performance: 'good'
    },
    {
      id: 'image-verification',
      name: 'Image Verification Model',
      type: 'Computer Vision',
      status: 'inactive',
      accuracy: 82.1,
      lastTrained: '2024-01-05',
      version: '1.0.8',
      trainingData: '25K images',
      performance: 'fair'
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'training': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (performance) => {
    switch (performance) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handleModelAction = (modelId, action) => {
    console.log(`${action} model ${modelId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Model Management</h1>
          <p className="text-gray-600">Monitor and manage AI models for crime analysis</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Brain className="w-4 h-4 mr-2" />
          Deploy New Model
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Models</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
              <Brain className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">91.2%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Training Data</p>
                <p className="text-2xl font-bold text-gray-900">185K</p>
              </div>
              <Database className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">CPU Usage</p>
                <p className="text-2xl font-bold text-gray-900">67%</p>
              </div>
              <Cpu className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {models.map((model) => (
          <Card key={model.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{model.name}</CardTitle>
                <Badge className={getStatusColor(model.status)}>
                  {model.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Type</p>
                  <p className="font-medium">{model.type}</p>
                </div>
                <div>
                  <p className="text-gray-600">Version</p>
                  <p className="font-medium">{model.version}</p>
                </div>
                <div>
                  <p className="text-gray-600">Training Data</p>
                  <p className="font-medium">{model.trainingData}</p>
                </div>
                <div>
                  <p className="text-gray-600">Last Trained</p>
                  <p className="font-medium">{model.lastTrained}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Accuracy</span>
                  <span className="font-semibold">{model.accuracy}%</span>
                </div>
                <Progress value={model.accuracy} className="h-2" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Performance:</span>
                  <span className={`text-sm font-medium ${getPerformanceColor(model.performance)}`}>
                    {model.performance}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                {model.status === 'active' ? (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleModelAction(model.id, 'pause')}
                  >
                    <Pause className="w-4 h-4 mr-1" />
                    Pause
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleModelAction(model.id, 'start')}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Start
                  </Button>
                )}
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleModelAction(model.id, 'retrain')}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Retrain
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleModelAction(model.id, 'configure')}
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Training Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Training Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium">Content Analysis Engine v1.3.0</p>
                <p className="text-sm text-gray-600">Training with new dataset (15K reports)</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-600 font-medium">In Progress</p>
                <Progress value={67} className="w-32 h-2 mt-1" />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Image Verification Model v1.1.0</p>
                <p className="text-sm text-gray-600">Scheduled for training (8K new images)</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 font-medium">Queued</p>
                <p className="text-xs text-gray-500">ETA: 2 hours</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}