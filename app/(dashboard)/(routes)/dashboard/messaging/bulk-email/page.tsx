'use client'

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Send, Users, FileText } from 'lucide-react';

export default function BulkEmail() {
  const [emailData, setEmailData] = useState({
    recipients: 'all-customers',
    subject: '',
    message: '',
    template: ''
  });

  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setSending(true);
    // Simulate sending
    setTimeout(() => {
      setSending(false);
      alert('Bulk email sent successfully!');
    }, 2000);
  };

  const templates = [
    { id: 'welcome', name: 'Welcome Email', content: 'Welcome to our store! We\'re excited to have you as a customer.' },
    { id: 'promotion', name: 'Promotional Email', content: 'Don\'t miss our special offers! Save up to 50% on selected items.' },
    { id: 'newsletter', name: 'Newsletter', content: 'Here\'s what\'s new this month at our store...' }
  ];

  const recipientGroups = [
    { id: 'all-customers', name: 'All Customers', count: 1250 },
    { id: 'vip-customers', name: 'VIP Customers', count: 85 },
    { id: 'new-customers', name: 'New Customers', count: 120 },
    { id: 'inactive-customers', name: 'Inactive Customers', count: 200 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Bulk Email</h1>
          <p className="text-gray-600">Send emails to multiple customers at once</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Compose Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="recipients">Recipients</Label>
                <Select value={emailData.recipients} onValueChange={(value) => setEmailData({...emailData, recipients: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {recipientGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name} ({group.count} recipients)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="template">Email Template (Optional)</Label>
                <Select value={emailData.template} onValueChange={(value) => {
                  const template = templates.find(t => t.id === value);
                  setEmailData({
                    ...emailData, 
                    template: value,
                    message: template ? template.content : emailData.message
                  });
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={emailData.subject}
                  onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                  placeholder="Enter email subject"
                />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={emailData.message}
                  onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                  placeholder="Enter your email message"
                  rows={10}
                />
              </div>

              <Button 
                onClick={handleSend} 
                disabled={sending || !emailData.subject || !emailData.message}
                className="w-full"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Bulk Email
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recipient Groups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recipientGroups.map((group) => (
                  <div key={group.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <span className="font-medium">{group.name}</span>
                    <span className="text-sm text-gray-600">{group.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Email Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {templates.map((template) => (
                  <div key={template.id} className="p-3 border rounded-lg">
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-gray-600 mt-1">{template.content.substring(0, 50)}...</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}