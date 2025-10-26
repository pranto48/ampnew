"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tools, Database, HardDrive, Trash2, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showSuccess, showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";

const Maintenance = () => {
  const [isBackingUp, setIsBackingUp] = React.useState(false);
  const [isCleaningLogs, setIsCleaningLogs] = React.useState(false);
  const [lastBackupTime, setLastBackupTime] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Simulate fetching last backup time
    const fetchLastBackup = setTimeout(() => {
      setLastBackupTime(new Date(Date.now() - 86400000 * 3).toLocaleString()); // 3 days ago
    }, 1000);
    return () => clearTimeout(fetchLastBackup);
  }, []);

  const handleBackupDatabase = async () => {
    setIsBackingUp(true);
    try {
      // Simulate database backup
      await new Promise(resolve => setTimeout(resolve, 2000));
      setLastBackupTime(new Date().toLocaleString());
      showSuccess("Database backup completed successfully!");
    } catch (error) {
      showError("Failed to backup database.");
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleCleanLogs = async () => {
    setIsCleaningLogs(true);
    try {
      // Simulate log cleaning
      await new Promise(resolve => setTimeout(resolve, 1500));
      showSuccess("Application logs cleaned successfully!");
    } catch (error) {
      showError("Failed to clean application logs.");
    } finally {
      setIsCleaningLogs(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card text-foreground border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Tools className="h-5 w-5" />
            System Maintenance
          </CardTitle>
          <CardDescription>
            Perform essential maintenance tasks for your AMPNM application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Database Backup */}
            <div className="space-y-3 p-4 border rounded-lg bg-background">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-500" /> Database Backup
              </h3>
              <p className="text-sm text-muted-foreground">
                Create a backup of your application's database.
              </p>
              {lastBackupTime ? (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" /> Last backup: {lastBackupTime}
                </p>
              ) : (
                <Skeleton className="h-4 w-1/2" />
              )}
              <Button
                onClick={handleBackupDatabase}
                disabled={isBackingUp}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isBackingUp ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <HardDrive className="h-4 w-4 mr-2" />
                )}
                {isBackingUp ? 'Backing Up...' : 'Backup Database'}
              </Button>
            </div>

            {/* Clean Application Logs */}
            <div className="space-y-3 p-4 border rounded-lg bg-background">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-500" /> Clean Logs
              </h3>
              <p className="text-sm text-muted-foreground">
                Remove old application log files to free up disk space.
              </p>
              <Button
                onClick={handleCleanLogs}
                disabled={isCleaningLogs}
                variant="destructive"
                className="w-full"
              >
                {isCleaningLogs ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                {isCleaningLogs ? 'Cleaning...' : 'Clean Application Logs'}
              </Button>
            </div>
          </div>

          {/* Placeholder for other maintenance tasks */}
          <div className="p-4 border rounded-lg bg-muted text-muted-foreground flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p>More maintenance options coming soon!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Maintenance;