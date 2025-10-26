"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Docker, RefreshCw, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showSuccess, showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";

const DockerUpdate = () => {
  const [currentVersion, setCurrentVersion] = React.useState<string | null>(null);
  const [latestVersion, setLatestVersion] = React.useState<string | null>(null);
  const [isChecking, setIsChecking] = React.useState(true);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [updateMessage, setUpdateMessage] = React.useState<string | null>(null);

  const fetchVersions = React.useCallback(async () => {
    setIsChecking(true);
    setUpdateMessage(null);
    try {
      // Simulate fetching current and latest versions
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentVersion('1.0.0'); // Mock current version
      setLatestVersion(Math.random() > 0.7 ? '1.0.0' : '1.1.0'); // Mock latest version
      showSuccess("Version check completed.");
    } catch (error) {
      showError("Failed to fetch Docker versions.");
      setCurrentVersion('Unknown');
      setLatestVersion('Unknown');
    } finally {
      setIsChecking(false);
    }
  }, []);

  React.useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    setUpdateMessage(null);
    try {
      // Simulate Docker update process
      await new Promise(resolve => setTimeout(resolve, 3000));
      setUpdateMessage("Docker application updated successfully to the latest version!");
      showSuccess("Update successful!");
      await fetchVersions(); // Re-fetch versions after update
    } catch (error) {
      setUpdateMessage("Failed to update Docker application. Check logs for details.");
      showError("Update failed.");
    } finally {
      setIsUpdating(false);
    }
  };

  const needsUpdate = currentVersion && latestVersion && currentVersion !== latestVersion;

  return (
    <Card className="bg-card text-foreground border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Docker className="h-5 w-5" />
          Docker Application Update
        </CardTitle>
        <CardDescription>
          Manage updates for your AMPNM Docker application.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Current Version:</p>
            {isChecking ? <Skeleton className="h-6 w-24" /> : <p className="text-lg font-semibold text-foreground">{currentVersion}</p>}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Latest Available Version:</p>
            {isChecking ? <Skeleton className="h-6 w-24" /> : <p className="text-lg font-semibold text-foreground">{latestVersion}</p>}
          </div>
        </div>

        {isChecking ? (
          <div className="flex items-center text-blue-500">
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Checking for updates...
          </div>
        ) : needsUpdate ? (
          <div className="bg-yellow-500/20 text-yellow-300 p-3 rounded-md flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            An update is available!
          </div>
        ) : (
          <div className="bg-green-500/20 text-green-300 p-3 rounded-md flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Your application is up to date.
          </div>
        )}

        {updateMessage && (
          <div className={`p-3 rounded-md ${updateMessage.includes('successfully') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
            {updateMessage}
          </div>
        )}

        <Button
          onClick={handleUpdate}
          disabled={isUpdating || isChecking || !needsUpdate}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isUpdating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          {isUpdating ? 'Updating...' : 'Update Application'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DockerUpdate;