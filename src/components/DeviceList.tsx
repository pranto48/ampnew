"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Server, Wifi, WifiOff, AlertCircle, Edit, Trash2, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { NetworkDevice, LicenseStatus, addDevice, updateDevicePosition, deleteDevice } from "@/services/networkDeviceService";
import { showSuccess, showError } from "@/utils/toast";
import { DeviceEditorDialog } from "@/components/DeviceEditorDialog";

interface DeviceListProps {
  devices: NetworkDevice[];
  isLoading: boolean;
  canManageDevices: boolean;
  licenseStatus: LicenseStatus;
  fetchDevices: () => void; // Renamed from fetchDashboardData for clarity in this component
  fetchLicenseStatus: () => void;
  currentMapId: string | null;
}

const DeviceList = ({
  devices,
  isLoading,
  canManageDevices,
  licenseStatus,
  fetchDevices,
  fetchLicenseStatus,
  currentMapId,
}: DeviceListProps) => {
  const [isDeviceEditorOpen, setIsDeviceEditorOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Partial<NetworkDevice> | undefined>(undefined);

  const handleAddDeviceClick = () => {
    if (!licenseStatus.can_add_device) {
      showError(licenseStatus.license_message || 'You have reached your device limit.');
      return;
    }
    if (!currentMapId) {
      showError("Please select a map or create a new one before adding a device.");
      return;
    }
    setEditingDevice(undefined); // Clear any previous editing state for a new device
    setIsDeviceEditorOpen(true);
  };

  const handleEditDeviceClick = (device: NetworkDevice) => {
    setEditingDevice(device);
    setIsDeviceEditorOpen(true);
  };

  const handleSaveDevice = async (deviceData: Omit<NetworkDevice, 'id' | 'user_id' | 'status' | 'last_ping' | 'last_ping_result' | 'map_name' | 'last_ping_output'>) => {
    try {
      if (editingDevice && editingDevice.id) {
        // Update existing device
        await updateDevicePosition([{
          id: editingDevice.id,
          name: deviceData.name,
          ip_address: deviceData.ip_address,
          type: deviceData.type,
          description: deviceData.description,
          map_id: editingDevice.map_id, // Keep original map_id for existing device
          position_x: editingDevice.position_x,
          position_y: editingDevice.position_y,
        }]);
        showSuccess('Device updated successfully.');
      } else {
        // Add new device
        if (!currentMapId) {
          showError("Cannot add device: No map selected.");
          return;
        }
        await addDevice({ ...deviceData, position_x: 0, position_y: 0, map_id: currentMapId });
        showSuccess('Device added successfully.');
      }
      fetchDevices(); // Refresh the device list
      fetchLicenseStatus(); // Re-fetch license status to update device count
      setIsDeviceEditorOpen(false);
    } catch (error: any) {
      showError(error.message || 'Failed to save device.');
    }
  };

  const handleDeleteDevice = async (deviceId: string) => {
    if (!window.confirm("Are you sure you want to delete this device? This action cannot be undone.")) {
      return;
    }
    try {
      await deleteDevice(deviceId);
      showSuccess('Device deleted successfully.');
      fetchDevices(); // Refresh the device list
      fetchLicenseStatus(); // Re-fetch license status to update device count
    } catch (error: any) {
      showError(error.message || 'Failed to delete device.');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Local Network Devices</CardTitle>
          <CardDescription>Monitor the status of devices on your local network</CardDescription>
        </div>
        {canManageDevices && (
          <div className="flex flex-col items-end gap-2">
            {!licenseStatus.can_add_device && (
              <Badge variant="destructive" className="text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                {licenseStatus.license_message || 'Device limit reached.'}
              </Badge>
            )}
            <Button
              onClick={handleAddDeviceClick}
              disabled={!licenseStatus.can_add_device || !currentMapId}
              title={!licenseStatus.can_add_device ? licenseStatus.license_message : (!currentMapId ? 'Select or create a map first' : 'Add a new device to your inventory')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Device
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : devices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Server className="h-12 w-12 mx-auto mb-4" />
            <p>No devices found. Add devices to start monitoring.</p>
            <Button onClick={fetchDevices} variant="outline" size="sm" className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {devices.map((device) => (
              <div
                key={device.id}
                className="flex items-center justify-between p-4 border rounded-lg transition-colors hover:bg-muted"
              >
                <div className="flex items-center gap-3">
                  {device.status === "online" ? (
                    <Wifi className="h-5 w-5 text-green-500" />
                  ) : device.status === "offline" ? (
                    <WifiOff className="h-5 w-5 text-red-500" />
                  ) : (
                    <Wifi className="h-5 w-5 text-gray-500" />
                  )}
                  <div>
                    <span className="font-medium">{device.name}</span>
                    <p className="text-sm text-muted-foreground">{device.ip_address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {device.last_ping && (
                    <div className="text-xs text-muted-foreground">
                      Last ping: {new Date(device.last_ping).toLocaleTimeString()}
                    </div>
                  )}
                  <Badge
                    variant={
                      device.status === "online" ? "default" :
                      device.status === "offline" ? "destructive" : "secondary"
                    }
                  >
                    {device.status || 'unknown'}
                  </Badge>
                  {canManageDevices && (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => handleEditDeviceClick(device)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteDevice(device.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <DeviceEditorDialog
        isOpen={isDeviceEditorOpen}
        onClose={() => setIsDeviceEditorOpen(false)}
        onSave={handleSaveDevice}
        device={editingDevice}
      />
    </Card>
  );
};

export default DeviceList;