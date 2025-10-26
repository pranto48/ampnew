"use client";

import { useState, useEffect, useCallback } from "react";
import { NetworkDevice, NetworkMap, getNetworkDevices, getMaps, getLicenseStatus, LicenseStatus } from "@/services/networkDeviceService";

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

export const useDashboardData = () => {
  const [maps, setMaps] = useState<NetworkMap[]>([]);
  const [currentMapId, setCurrentMapId] = useState<string | null>(null);
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalDevices: 0,
    onlineDevices: 0,
    offlineDevices: 0,
    unknownDevices: 0,
    totalMaps: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMaps = useCallback(async () => {
    try {
      const fetchedMaps = await getMaps();
      setMaps(fetchedMaps);
      if (fetchedMaps.length > 0 && !currentMapId) {
        setCurrentMapId(fetchedMaps[0].id); // Set first map as default if none selected
      } else if (fetchedMaps.length === 0) {
        setCurrentMapId(null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch maps.");
      setMaps([]);
      setCurrentMapId(null);
    }
  }, [currentMapId]);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedDevices = await getNetworkDevices(currentMapId);
      setDevices(fetchedDevices);

      // Calculate dashboard stats
      const online = fetchedDevices.filter(d => d.status === 'online').length;
      const offline = fetchedDevices.filter(d => d.status === 'offline').length;
      const unknown = fetchedDevices.filter(d => d.status === 'unknown').length;

      setDashboardStats({
        totalDevices: fetchedDevices.length,
        onlineDevices: online,
        offlineDevices: offline,
        unknownDevices: unknown,
        totalMaps: maps.length, // Use already fetched maps count
      });

      // Placeholder for recent activity (replace with actual API call if available)
      setRecentActivity([
        { id: '1', timestamp: new Date().toISOString(), message: 'System started.' },
        { id: '2', timestamp: new Date().toISOString(), message: `${online} devices online.` },
      ]);

    } catch (err: any) {
      setError(err.message || "Failed to fetch dashboard data.");
      setDevices([]);
      setDashboardStats({
        totalDevices: 0,
        onlineDevices: 0,
        offlineDevices: 0,
        unknownDevices: 0,
        totalMaps: maps.length,
      });
      setRecentActivity([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentMapId, maps.length]);

  useEffect(() => {
    fetchMaps();
  }, [fetchMaps]);

  useEffect(() => {
    if (currentMapId !== null || maps.length === 0) { // Only fetch devices if a map is selected or if there are no maps
      fetchDashboardData();
    }
  }, [currentMapId, maps.length, fetchDashboardData]);

  return {
    maps,
    currentMapId,
    setCurrentMapId,
    devices,
    dashboardStats,
    recentActivity,
    isLoading,
    error,
    fetchMaps,
    fetchDashboardData,
  };
};