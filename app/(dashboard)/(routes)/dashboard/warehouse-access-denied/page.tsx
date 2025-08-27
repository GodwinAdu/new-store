import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ArrowLeft, Warehouse } from "lucide-react";
import Link from "next/link";

export default function WarehouseAccessDeniedPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
              <Warehouse className="h-8 w-8 text-orange-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Warehouse Access Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertTitle className="text-orange-800">Access Denied</AlertTitle>
              <AlertDescription className="text-orange-700">
                You don't have permission to access warehouse features. You need to be assigned to at least one warehouse to use these features.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">What you can do:</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  Contact your system administrator to assign you to a warehouse
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  Check with your manager about warehouse access permissions
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  Ensure your user profile has the correct warehouse assignments
                </li>
              </ul>
            </div>

            <div className="flex justify-center">
              <Button asChild variant="outline">
                <Link href="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}