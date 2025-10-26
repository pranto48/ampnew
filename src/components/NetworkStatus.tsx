"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Network, CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const NetworkStatus = () => {
  const [status, setStatus] = React.useState<'loading' | 'online' | 'offline' | 'degraded'>('loading');
  const [details, setDetails] = React.useState<string[]>([]);

  React.useEffect(() => {
    // Simulate fetching network status
    const fetchStatus = setTimeout(() => {
      const randomStatus = Math.random();
      if (randomStatus < 0.6) {
        setStatus('online');
        setDetails(['All services operational.', 'Internet connectivity: Stable.']);
      } else if (randomStatus < 0.9) {
        setStatus('degraded');
        setDetails(['Some services experiencing minor delays.', 'External API response time: High.']);
      } else {
        setStatus('offline');
        setDetails(['Critical network services are down.', 'No internet connectivity detected.']);
      }
    }, 2000);

    return () => clearTimeout(fetchStatus);
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'online': return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'offline': return <XCircle className="h-6 w-6 text-red-500" />;
      case 'degraded': return <HelpCircle className="h-6 w-6 text-yellow-500" />;
      default: return <Network className="h-6 w-6 text-muted-foreground animate-pulse" />;
    }
  };

  const getStatusBadgeVariant = () => {
    switch (status) {
      case 'online': return 'default';
      case 'offline': return 'destructive';
      case 'degraded': return 'warning'; // Assuming a 'warning' variant exists or can be styled
      default: return 'secondary';
    }
  };

  return (
    <Card className="bg-card text-foreground border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Network className="h-5 w-5" />
          Overall Network Status
        </CardTitle>
        <CardDescription>
          Current operational status of your network and services.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          {getStatusIcon()}
          {status === 'loading' ? (
            <Skeleton className="h-8 w-48" />
          ) : (
            <Badge variant={getStatusBadgeVariant()} className="text-lg capitalize">
              {status}
            </Badge>
          )}
        </div>
        <div className="space-y-2">
          {status === 'loading' ? (
            <>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </>
          ) : (
            details.map((detail, index) => (
              <p key={index} className="text-sm text-muted-foreground">{detail}</p>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NetworkStatus;