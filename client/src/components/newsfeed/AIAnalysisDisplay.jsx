"use client";

import { useState } from 'react';
import { 
  Brain, 
  Target, 
  AlertTriangle, 
  Shield, 
  Eye,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Bot,
  User
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AIAnalysisDisplay = ({ aiAnalysis }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!aiAnalysis || !aiAnalysis.overallCertainty) {
    return null;
  }

  const getCertaintyColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (percentage >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getThreatLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getThreatLevelIcon = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Shield className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  return (
    <Card className="w-full border-l-4 border-l-blue-500 bg-blue-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg font-semibold text-blue-900">
              AI Analysis Results
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 hover:text-blue-700"
          >
            <Eye className="w-4 h-4 mr-1" />
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Certainty Percentage */}
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-white border">
            <Target className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">AI Certainty</p>
              <p className={`font-bold text-lg ${getCertaintyColor(aiAnalysis.overallCertainty)}`}>
                {aiAnalysis.overallCertainty}%
              </p>
            </div>
          </div>

          {/* Threat Level */}
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-white border">
            {getThreatLevelIcon(aiAnalysis.aiThreatLevel)}
            <div>
              <p className="text-sm text-gray-600">Threat Level</p>
              <p className={`font-bold text-lg ${getThreatLevelColor(aiAnalysis.aiThreatLevel)}`}>
                {aiAnalysis.aiThreatLevel}
              </p>
            </div>
          </div>

          {/* Analysis Status */}
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-white border">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Analysis Status</p>
              <p className="font-bold text-lg text-green-600">
                Complete
              </p>
            </div>
          </div>
        </div>

        {/* Crime Badges */}
        {aiAnalysis.aiGeneratedBadges && aiAnalysis.aiGeneratedBadges.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Detected Crime Types:</h4>
            <div className="flex flex-wrap gap-2">
              {aiAnalysis.aiGeneratedBadges.map((badge, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="bg-red-50 text-red-700 border-red-200"
                >
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* AI Detection Results */}
        {aiAnalysis.aiDetection && aiAnalysis.aiDetection.hasAIGeneratedContent && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Bot className="w-4 h-4 mr-2 text-orange-600" />
              AI-Generated Content Detected
            </h4>
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-orange-800">
                  Confidence: {Math.round(aiAnalysis.aiDetection.overallConfidence * 100)}%
                </span>
                <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                  AI Detected
                </Badge>
              </div>
              <div className="text-sm text-orange-700">
                <p className="mb-1">Flagged fields:</p>
                <ul className="list-disc list-inside space-y-1">
                  {aiAnalysis.aiDetection.flaggedFields.map((field, index) => (
                    <li key={index}>
                      {field.field}: {Math.round(field.confidence * 100)}% confidence
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Deepfake Detection Results */}
        {aiAnalysis.deepfake && aiAnalysis.deepfake.anyFlagged && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
              Deepfake Content Detected
            </h4>
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-red-800">
                  Deepfake Images Found
                </span>
                <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                  Deepfake
                </Badge>
              </div>
              <div className="text-sm text-red-700">
                <p className="mb-1">Flagged images:</p>
                <ul className="list-disc list-inside space-y-1">
                  {aiAnalysis.deepfake.items.map((item, index) => (
                    <li key={index}>
                      Image {index + 1}: {item.label} ({Math.round(item.confidence * 100)}% confidence)
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Analysis */}
        {showDetails && (
          <div className="space-y-4">
            {/* Media Analysis */}
            {aiAnalysis.mediaAnalysis && aiAnalysis.mediaAnalysis.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Media Analysis:</h4>
                {aiAnalysis.mediaAnalysis.map((media, index) => (
                  <div key={index} className="mb-3 p-3 bg-white rounded-lg border">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">File {index + 1}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>AI Description:</strong> {media.analysis.aiDescription}
                    </p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-600">
                        Certainty: <span className="font-semibold">{media.analysis.certaintyPercentage}%</span>
                      </span>
                      <span className="text-gray-600">
                        Threat: <span className="font-semibold">{media.analysis.threatLevel}</span>
                      </span>
                    </div>
                    {media.analysis.recommendedActions && (
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Recommended:</strong> {media.analysis.recommendedActions}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Text Analysis */}
            {aiAnalysis.textAnalysis && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Text Analysis:</h4>
                <div className="p-3 bg-white rounded-lg border">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Enhanced Description:</strong> {aiAnalysis.textAnalysis.enhancedDescription}
                  </p>
                  {aiAnalysis.textAnalysis.contextAnalysis && (
                    <p className="text-sm text-gray-600">
                      <strong>Context:</strong> {aiAnalysis.textAnalysis.contextAnalysis}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIAnalysisDisplay; 