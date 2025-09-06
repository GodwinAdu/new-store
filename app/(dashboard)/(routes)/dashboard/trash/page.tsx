'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, RotateCcw, X, AlertTriangle } from 'lucide-react';

const trashedItems = [
  { id: '1', type: 'Product', name: 'Old Laptop Model', deletedBy: 'John Doe', deletedAt: '2024-12-15', reason: 'Discontinued' },
  { id: '2', type: 'Customer', name: 'Inactive Customer Co.', deletedBy: 'Jane Smith', deletedAt: '2024-12-10', reason: 'Account closed' },
  { id: '3', type: 'Sale', name: 'Sale #12340', deletedBy: 'Mike Johnson', deletedAt: '2024-12-08', reason: 'Duplicate entry' },
  { id: '4', type: 'Supplier', name: 'Old Supplier Ltd.', deletedBy: 'Sarah Wilson', deletedAt: '2024-12-05', reason: 'Contract ended' }
];

export default function TrashPage() {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Product': return 'bg-blue-100 text-blue-800';
      case 'Customer': return 'bg-green-100 text-green-800';
      case 'Sale': return 'bg-purple-100 text-purple-800';
      case 'Supplier': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRestore = (id: string) => {
    console.log('Restoring item:', id);
    // Implement restore logic
  };

  const handlePermanentDelete = (id: string) => {
    if (confirm('Are you sure you want to permanently delete this item? This action cannot be undone.')) {
      console.log('Permanently deleting item:', id);
      // Implement permanent delete logic
    }
  };

  const handleEmptyTrash = () => {
    if (confirm('Are you sure you want to empty the trash? All items will be permanently deleted and cannot be recovered.')) {
      console.log('Emptying trash');
      // Implement empty trash logic
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Trash</h1>
          <p className="text-gray-600">Manage deleted items and restore if needed</p>
        </div>
        <Button variant="destructive" onClick={handleEmptyTrash} disabled={trashedItems.length === 0}>
          <Trash2 className="h-4 w-4 mr-2" />
          Empty Trash
        </Button>
      </div>

      {trashedItems.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <Trash2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Trash is Empty</h3>
              <p className="text-gray-600">No deleted items to display</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Deleted Items ({trashedItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trashedItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg bg-red-50 border-red-200">
                  <div className="flex items-center gap-4">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-600">
                        Deleted by {item.deletedBy} on {item.deletedAt}
                      </div>
                      <div className="text-sm text-gray-500">Reason: {item.reason}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={getTypeColor(item.type)}>
                      {item.type}
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(item.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Restore
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePermanentDelete(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Delete Forever
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Trash Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Items in trash are kept for 30 days before automatic permanent deletion</p>
            <p>• Restored items will be returned to their original location</p>
            <p>• Permanently deleted items cannot be recovered</p>
            <p>• Empty trash to free up storage space</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}