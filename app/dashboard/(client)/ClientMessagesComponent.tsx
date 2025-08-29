import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users } from "lucide-react";

export function ClientMessagesComponent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Pas de conversations pour le moment
            </h3>
            <p className="text-gray-600">
              Vos conversations avec les artisans apparaîtront ici une fois
              qu'ils auront accepté vos demandes
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
