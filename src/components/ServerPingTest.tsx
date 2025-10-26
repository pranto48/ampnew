"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Desktop, Send, Loader2 } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";

const ServerPingTest = () => {
  const [ipAddress, setIpAddress] = useState('');
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleServerPing = async () => {
    if (!ipAddress.trim()) {
      showError("Please enter an IP address or hostname.");
      return;
    }

    setIsLoading(true);
    setPingResult(null);

    try {
      // Simulate a server-side ping request
      const response = await new Promise<string>((resolve) => {
        setTimeout(() => {
          const success = Math.random() > 0.4; // 60% chance of success
          if (success) {
            resolve(`Server ping to ${ipAddress} successful! Latency: ${Math.floor(Math.random() * 50) + 5}ms`);
          } else {
            resolve(`Server ping to ${ipAddress} failed. Request timed out.`);
          }
        }, 2000);
      });
      setPingResult(response);
      showSuccess("Server ping test completed.");
    } catch (error) {
      console.error("Server ping test error:", error);
      showError("An error occurred during the server ping test.");
      setPingResult("Error performing server ping test.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-card text-foreground border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Desktop className="h-5 w-5" />
          Server Ping Test
        </CardTitle>
        <CardDescription>
          Initiate a ping test from the AMPNM server to a target IP address or hostname.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Enter IP address or hostname (e.g., google.com)"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            disabled={isLoading}
            className="bg-background text-foreground border-border"
          />
          <Button onClick={handleServerPing} disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {isLoading ? 'Pinging...' : 'Server Ping'}
          </Button>
        </div>
        {pingResult && (
          <div className="bg-muted p-3 rounded-md text-sm font-mono text-muted-foreground">
            {pingResult}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServerPingTest;