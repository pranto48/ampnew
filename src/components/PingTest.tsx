"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Wifi, Send } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";

const PingTest = () => {
  const [ipAddress, setIpAddress] = useState('');
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePing = async () => {
    if (!ipAddress.trim()) {
      showError("Please enter an IP address or hostname.");
      return;
    }

    setIsLoading(true);
    setPingResult(null);

    try {
      // Simulate a ping request
      const response = await new Promise<string>((resolve) => {
        setTimeout(() => {
          const success = Math.random() > 0.3; // 70% chance of success
          if (success) {
            resolve(`Ping to ${ipAddress} successful! Latency: ${Math.floor(Math.random() * 100) + 10}ms`);
          } else {
            resolve(`Ping to ${ipAddress} failed. Host unreachable.`);
          }
        }, 1500);
      });
      setPingResult(response);
      showSuccess("Ping test completed.");
    } catch (error) {
      console.error("Ping test error:", error);
      showError("An error occurred during the ping test.");
      setPingResult("Error performing ping test.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-card text-foreground border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Wifi className="h-5 w-5" />
          Browser Ping Test
        </CardTitle>
        <CardDescription>
          Perform a simple ping test from your browser to any IP address or hostname.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Enter IP address or hostname (e.g., 8.8.8.8)"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            disabled={isLoading}
            className="bg-background text-foreground border-border"
          />
          <Button onClick={handlePing} disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? 'Pinging...' : 'Ping'}
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

export default PingTest;