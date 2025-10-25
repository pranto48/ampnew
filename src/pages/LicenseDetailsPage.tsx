"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ShieldHalf } from "lucide-react";
import LicenseManager from "@/components/LicenseManager";
import { useDashboardData } from "@/hooks/useDashboardData"; // To get fetchLicenseStatus
import { getLicenseStatus, LicenseStatus } from "@/services/networkDeviceService"; // To get initial license status
import { useState, useEffect, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const LicenseDetailsPage = () => {
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus>({
    app_license_key: "",
    can_add_device: false,
    max_devices: 0,
    license_message: "Loading license status...",
    license_status_code: "unknown",
    license_grace_period_end: null,
    installation_id: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchLicenseStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const status = await getLicenseStatus();
      setLicenseStatus(status);
    } catch (error) {
      console.error("Failed to load license status:", error);
      setLicenseStatus(prev => ({
        ...prev,
        license_message: "Error loading license status.",
        license_status_code: "error",
      }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLicenseStatus();
  }, [fetchLicenseStatus]);

  return (
    <div className="space-y-6">
      <Card className="bg-card text-foreground border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <ShieldHalf className="h-5 w-5" />
            Application License Details
          </CardTitle>
          <CardDescription>
            View your AMPNM application's license status and manage your license key.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <LicenseManager licenseStatus={licenseStatus} fetchLicenseStatus={fetchLicenseStatus} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LicenseDetailsPage;