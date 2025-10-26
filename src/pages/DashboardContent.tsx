"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Wifi, Server, Clock, RefreshCw, Network, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { NetworkDevice, NetworkMap, LicenseStatus } from "@/services/networkDeviceService"; // Import interfaces

interface DashboardStats {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  unknownDevices: number;
  totalMaps: number;
}

interface ActivityLog {
  id: string;
  timestamp: string;
  message: string;
}

interface DashboardContentProps {
  maps: NetworkMap[];
  currentMapId: string | null;
  setCurrentMapId: (mapId: string) => void;
  devices: NetworkDevice[];
  dashboardStats: DashboardStats;
  recentActivity: ActivityLog[];
  isLoading: boolean;
  fetchMaps: () => void;
  fetchDashboardData: () => void;
  licenseStatus: LicenseStatus;
  fetchLicenseStatus: () => void;
}

const DashboardContent = ({
  maps,
  currentMapId,
  setCurrentMapId,
  devices,
  dashboardStats,
  recentActivity,
  isLoading,
  fetchMaps,
  fetchDashboardData,
  licenseStatus,
  fetchLicenseStatus,
}: DashboardContentProps) => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card text-foreground border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-1/2" />
            ) : (
              <div className="text-2xl font-bold">{dashboardStats.totalDevices}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {dashboardStats.onlineDevices} online, {dashboardStats.offlineDevices} offline
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card text-foreground border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Devices</CardTitle>
            <Wifi className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-1/2" />
            ) : (
              <div className="text-2xl font-bold text-green-500">{dashboardStats.onlineDevices}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Currently reachable
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card text-foreground border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline Devices</CardTitle>
            <Wifi className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-1/2" />
            ) : (
              <div className="text-2xl font-bold text-red-500">{dashboardStats.offlineDevices}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Not responding to pings
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card text-foreground border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Maps</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-1/2" />
            ) : (
              <div className="text-2xl font-bold">{dashboardStats.totalMaps}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Configured network layouts
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-card text-foreground border-border">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest events and system notifications.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No recent activity.</p>
            ) : (
              <div className="space-y-2">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>
                      <span className="font-medium text-foreground">{new Date(activity.timestamp).toLocaleTimeString()}:</span>{" "}
                      {activity.message}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-card text-foreground border-border">
          <CardHeader>
            <CardTitle>License Status</CardTitle>
            <CardDescription>Your application license details.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">
                  Status:{" "}
                  <Badge
                    variant={
                      licenseStatus.license_status_code === "active" || licenseStatus.license_status_code === "free"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {licenseStatus.license_status_code.charAt(0).toUpperCase() + licenseStatus.license_status_code.slice(1)}
                  </Badge>
                </p>
                <p className="text-sm text-muted-foreground">{licenseStatus.license_message}</p>
                {licenseStatus.license_grace_period_end && (
                  <p className="text-sm text-yellow-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" /> Grace period ends: {new Date(licenseStatus.license_grace_period_end).toLocaleDateString()}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">Max Devices: {licenseStatus.max_devices}</p>
                <p className="text-sm text-muted-foreground">Installation ID: {licenseStatus.installation_id}</p>
                <Button onClick={fetchLicenseStatus} variant="outline" size="sm" className="mt-4">
                  <RefreshCw className="h-4 w-4 mr-2" /> Refresh License
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardContent;