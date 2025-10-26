"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { History, Wifi, WifiOff, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface PingRecord {
  id: string;
  deviceName: string;
  ipAddress: string;
  timestamp: string;
  status: 'online' | 'offline';
  latencyMs: number | null;
}

const PingHistory = () => {
  const [history, setHistory] = React.useState<PingRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate fetching ping history
    const fetchHistory = setTimeout(() => {
      const mockHistory: PingRecord[] = [
        { id: '1', deviceName: 'Server 1', ipAddress: '192.168.1.10', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'online', latencyMs: 25 },
        { id: '2', deviceName: 'Router', ipAddress: '192.168.1.1', timestamp: new Date(Date.now() - 1800000).toISOString(), status: 'online', latencyMs: 5 },
        { id: '3', deviceName: 'Workstation 5', ipAddress: '192.168.1.150', timestamp: new Date(Date.now() - 900000).toISOString(), status: 'offline', latencyMs: null },
        { id: '4', deviceName: 'Server 1', ipAddress: '192.168.1.10', timestamp: new Date(Date.now() - 300000).toISOString(), status: 'online', latencyMs: 28 },
        { id: '5', deviceName: 'Router', ipAddress: '192.168.1.1', timestamp: new Date(Date.now() - 60000).toISOString(), status: 'online', latencyMs: 6 },
      ];
      setHistory(mockHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(fetchHistory);
  }, []);

  return (
    <Card className="bg-card text-foreground border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <History className="h-5 w-5" />
          Ping History
        </CardTitle>
        <CardDescription>
          Review past ping results for your monitored devices.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4" />
            <p>No ping history available yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg bg-background">
                <div className="flex items-center gap-3">
                  {record.status === 'online' ? (
                    <Wifi className="h-5 w-5 text-green-500" />
                  ) : (
                    <WifiOff className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <span className="font-medium text-foreground">{record.deviceName} ({record.ipAddress})</span>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(record.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={record.status === 'online' ? 'default' : 'destructive'}
                    className="capitalize"
                  >
                    {record.status}
                  </Badge>
                  {record.latencyMs !== null && (
                    <span className="text-sm text-muted-foreground">{record.latencyMs}ms</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PingHistory;