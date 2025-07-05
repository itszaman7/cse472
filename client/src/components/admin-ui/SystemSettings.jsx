"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Settings, 
  Shield, 
  Bell, 
  Database, 
  Mail,
  Globe,
  Lock,
  Save
} from 'lucide-react';

export default function SystemSettings() {
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'SafetyNet',
    siteDescription: 'Community Crime Reporting Platform',
    maintenanceMode: false,
    
    // Security Settings
    requireEmailVerification: true,
    enableTwoFactor: false,
    sessionTimeout: '24',
    maxLoginAttempts: '5',
    
    // AI Settings
    authenticityThreshold: '70',
    autoVerifyThreshold: '90',
    enableAutoModeration: true,
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    adminAlerts: true,
    
    // Content Settings
    maxReportLength: '2000',
    allowAnonymousReports: true,
    requireLocationVerification: false,
    
    // API Settings
    rateLimit: '100',
    apiTimeout: '30'
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving settings:', settings);
    // Here you would typically save to your backend
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">Configure platform settings and preferences</p>
        </div>
        <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => handleSettingChange('siteName', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
              <Switch
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
              <Switch
                id="requireEmailVerification"
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => handleSettingChange('requireEmailVerification', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="enableTwoFactor">Enable Two-Factor Auth</Label>
              <Switch
                id="enableTwoFactor"
                checked={settings.enableTwoFactor}
                onCheckedChange={(checked) => handleSettingChange('enableTwoFactor', checked)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => handleSettingChange('maxLoginAttempts', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* AI Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="w-5 h-5 mr-2" />
              AI & Moderation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="authenticityThreshold">Authenticity Threshold (%)</Label>
              <Input
                id="authenticityThreshold"
                type="number"
                min="0"
                max="100"
                value={settings.authenticityThreshold}
                onChange={(e) => handleSettingChange('authenticityThreshold', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="autoVerifyThreshold">Auto-Verify Threshold (%)</Label>
              <Input
                id="autoVerifyThreshold"
                type="number"
                min="0"
                max="100"
                value={settings.autoVerifyThreshold}
                onChange={(e) => handleSettingChange('autoVerifyThreshold', e.target.value)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="enableAutoModeration">Enable Auto-Moderation</Label>
              <Switch
                id="enableAutoModeration"
                checked={settings.enableAutoModeration}
                onCheckedChange={(checked) => handleSettingChange('enableAutoModeration', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="pushNotifications">Push Notifications</Label>
              <Switch
                id="pushNotifications"
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="adminAlerts">Admin Alerts</Label>
              <Switch
                id="adminAlerts"
                checked={settings.adminAlerts}
                onCheckedChange={(checked) => handleSettingChange('adminAlerts', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Content Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Content Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maxReportLength">Max Report Length (characters)</Label>
              <Input
                id="maxReportLength"
                type="number"
                value={settings.maxReportLength}
                onChange={(e) => handleSettingChange('maxReportLength', e.target.value)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="allowAnonymousReports">Allow Anonymous Reports</Label>
              <Switch
                id="allowAnonymousReports"
                checked={settings.allowAnonymousReports}
                onCheckedChange={(checked) => handleSettingChange('allowAnonymousReports', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="requireLocationVerification">Require Location Verification</Label>
              <Switch
                id="requireLocationVerification"
                checked={settings.requireLocationVerification}
                onCheckedChange={(checked) => handleSettingChange('requireLocationVerification', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* API Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="w-5 h-5 mr-2" />
              API Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rateLimit">Rate Limit (requests/minute)</Label>
              <Input
                id="rateLimit"
                type="number"
                value={settings.rateLimit}
                onChange={(e) => handleSettingChange('rateLimit', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apiTimeout">API Timeout (seconds)</Label>
              <Input
                id="apiTimeout"
                type="number"
                value={settings.apiTimeout}
                onChange={(e) => handleSettingChange('apiTimeout', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Database className="w-6 h-6 text-green-600" />
              </div>
              <p className="font-medium text-green-900">Database</p>
              <p className="text-sm text-green-600">Operational</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Globe className="w-6 h-6 text-green-600" />
              </div>
              <p className="font-medium text-green-900">API</p>
              <p className="text-sm text-green-600">Operational</p>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Mail className="w-6 h-6 text-yellow-600" />
              </div>
              <p className="font-medium text-yellow-900">Email Service</p>
              <p className="text-sm text-yellow-600">Degraded</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}