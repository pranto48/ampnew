"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Wifi, Server } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";

interface ScannedDevice {
  ip: string;
  hostname: string;
  status: 'online' | 'offline';
  ports: number[];
}

const NetworkScanner = () => {
  const [subnet, setSubnet] = useState('192.168.1.0/24');
  const [scanResults, setScanResults] = useState<ScannedDevice[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleScan = async () => {
    if (!subnet.trim()) {
      showError("Please enter a subnet to scan.");
      return;
    }

    setIsLoading(true);
    setScanResults(null);

    try {
      // Simulate network scanning
      const simulatedResults: ScannedDevice[] = await new Promise((resolve) => {
        setTimeout(() => {
          const results: ScannedDevice[] = [];
          for (let i = 1; i <= 5; i++) { // Simulate finding 5 devices
            const ip = `192.168.1.${100 + i}`;
            results.push({
              ip,
              hostname: `device-${i}.local`,
              status: Math.random() > 0.2 ? 'online' : 'offline',
              ports: Math.random() > 0.5 ? [80, 443, 22] : [80],
            });
          }
          resolve(results);
        }, 3000); // Simulate a 3-second scan
      });
      setScanResults(simulatedResults);
      showSuccess("Network scan completed.");
    } catch (error) {
      console.error("Network scan error:", error);
      showError("An error occurred during the network scan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-card text-foreground border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Search className="h-5 w-5" />
          Network Scanner
        </CardTitle>
        <CardDescription>
          Scan your local network for active devices and open ports.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Enter subnet (e.g., 192.168.1.0/24)"
            value={subnet}
            onChange={(e) => setSubnet(e.target.value)}
            disabled={isLoading}
            className="bg-background text-foreground border-border"
          />
          <Button onClick={handleScan} disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            {isLoading ? 'Scanning...' : 'Scan Network'}
          </Button>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        )}

        {scanResults && scanResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Scan Results:</h3>
            {scanResults.map((device, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-background">
                <div className="flex items-center gap-3">
                  {device.status === 'online' ? (
                    <Wifi className="h-5 w-5 text-green-500" />
                  ) : (
                    <Wifi className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <span className="font-medium text-foreground">{device.hostname}</span>
                    <p className="text-sm text-muted-foreground">{device.ip}</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Ports: {device.ports.length > 0 ? device.ports.join(', ') : 'None'}
                </div>
              </div>
            ))}
          </div>
        )}

        {scanResults && scanResults.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Server className="h-12 w-12 mx-auto mb-4" />
            <p>No devices found on the specified subnet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NetworkScanner;