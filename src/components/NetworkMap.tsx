"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Save, RefreshCw, AlertCircle, Network as NetworkIcon, Trash2, Edit } from "lucide-react";
import { NetworkDevice, getNetworkDevices, updateDevicePosition, getMaps, createMap, updateMap, deleteDevice, deleteMap } from "@/services/networkDeviceService";
import { showSuccess, showError } from "@/utils/toast";
import { DeviceEditorDialog } from "@/components/DeviceEditorDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Custom Node for Network Devices
const DeviceNode = ({ data }: { data: NetworkDevice & { onEdit: (device: NetworkDevice) => void; onDelete: (deviceId: string) => void; canManageDevices: boolean } }) => {
  const statusColor = data.status === 'online' ? 'bg-green-500' : data.status === 'offline' ? 'bg-red-500' : 'bg-gray-500';
  const statusText = data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : 'Unknown';

  return (
    <div className="p-2 shadow-md rounded-md bg-card border border-border text-foreground min-w-[150px] text-center relative">
      <div className="flex items-center justify-center mb-1">
        <NetworkIcon className="h-5 w-5 mr-2 text-primary" />
        <div className="font-bold text-lg">{data.name}</div>
      </div>
      <div className="text-sm text-muted-foreground">{data.ip_address}</div>
      <Badge className={`mt-2 ${statusColor}`}>{statusText}</Badge>
      {data.last_ping && (
        <div className="text-xs text-muted-foreground mt-1">Last Ping: {new Date(data.last_ping).toLocaleTimeString()}</div>
      )}
      {data.canManageDevices && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6">
              <Edit className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover text-popover-foreground border-border">
            <DropdownMenuItem onClick={() => data.onEdit(data)} className="cursor-pointer">
              <Edit className="mr-2 h-4 w-4" /> Edit Device
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => data.onDelete(data.id)} className="text-destructive cursor-pointer">
              <Trash2 className="mr-2 h-4 w-4" /> Delete Device
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

const nodeTypes = { deviceNode: DeviceNode };

interface NetworkMapProps {
  devices: NetworkDevice[];
  onMapUpdate: () => void; // Function to refresh dashboard data
  mapId: string | null;
  canAddDevice: boolean;
  licenseMessage: string;
  userRole: string;
  maps: { id: string; name: string }[]; // Pass maps for deletion
  setCurrentMapId: (mapId: string | null) => void; // To update selected map after deletion
}

const NetworkMapContent = ({ devices, onMapUpdate, mapId, canAddDevice, licenseMessage, userRole, maps, setCurrentMapId }: NetworkMapProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeviceEditorOpen, setIsDeviceEditorOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Partial<NetworkDevice> | undefined>(undefined);
  const [isMapCreatorOpen, setIsMapCreatorOpen] = useState(false);
  const [newMapName, setNewMapName] = useState('');
  const [isMapDeletionAlertOpen, setIsMapDeletionAlertOpen] = useState(false);
  const [mapToDeleteId, setMapToDeleteId] = useState<string | null>(null);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const canManageDevices = userRole === "admin" || userRole === "network_manager";

  // Effect to update nodes when devices prop changes
  useEffect(() => {
    if (!mapId) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const initialNodes: Node[] = devices
      .filter(device => device.map_id === mapId)
      .map((device) => ({
        id: device.id,
        type: 'deviceNode',
        position: { x: device.position_x || 100, y: device.position_y || 100 },
        data: { ...device, onEdit: handleEditDevice, onDelete: handleDeleteDevice, canManageDevices },
      }));
    setNodes(initialNodes);
    // For simplicity, edges are not persisted in the current backend.
    // If you want to persist edges, you'd need a new table and API endpoints.
    setEdges([]); 
  }, [devices, mapId, setNodes, setEdges, canManageDevices]);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const handleSaveLayout = useCallback(async () => {
    if (!mapId) {
      showError("No map selected to save layout.");
      return;
    }
    setIsSaving(true);
    try {
      const updates = nodes.map(node => ({
        id: node.id,
        position_x: node.position.x,
        position_y: node.position.y,
      }));
      await updateDevicePosition(updates);
      showSuccess("Map layout saved successfully!");
      onMapUpdate(); // Refresh dashboard data to reflect changes
    } catch (error: any) {
      showError(error.message || "Failed to save map layout.");
    } finally {
      setIsSaving(false);
    }
  }, [nodes, mapId, onMapUpdate]);

  const handleAddDeviceClick = () => {
    if (!canAddDevice) {
      showError(licenseMessage || 'You have reached your device limit.');
      return;
    }
    if (!mapId) {
      showError("Please select a map or create a new one before adding a device.");
      return;
    }
    setEditingDevice(undefined); // Clear any previous editing state
    setIsDeviceEditorOpen(true);
  };

  const handleEditDevice = (device: NetworkDevice) => {
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
          map_id: mapId, // Ensure device is linked to current map
          position_x: editingDevice.position_x, // Keep current position
          position_y: editingDevice.position_y, // Keep current position
        }]);
        showSuccess('Device updated successfully.');
      } else {
        // Add new device
        await addDevice({ ...deviceData, position_x: 100, position_y: 100, map_id: mapId });
        showSuccess('Device added successfully.');
      }
      onMapUpdate(); // Refresh the device list and map
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
      onMapUpdate(); // Refresh the device list and map
    } catch (error: any) {
      showError(error.message || 'Failed to delete device.');
    }
  };

  const handleCreateMap = async () => {
    if (!newMapName.trim()) {
      showError("Map name cannot be empty.");
      return;
    }
    try {
      await createMap(newMapName.trim());
      showSuccess(`Map '${newMapName}' created successfully!`);
      setNewMapName('');
      setIsMapCreatorOpen(false);
      onMapUpdate(); // Refresh maps list in MainApp
    } catch (error: any) {
      showError(error.message || "Failed to create map.");
    }
  };

  const handleDeleteMap = async () => {
    if (!mapToDeleteId) return;

    try {
      await deleteMap(mapToDeleteId);
      showSuccess('Map deleted successfully.');
      onMapUpdate(); // Refresh maps list
      setCurrentMapId(null); // Deselect map
      setIsMapDeletionAlertOpen(false);
      setMapToDeleteId(null);
    } catch (error: any) {
      showError(error.message || 'Failed to delete map.');
    }
  };

  const openMapDeletionAlert = (mapId: string) => {
    setMapToDeleteId(mapId);
    setIsMapDeletionAlertOpen(true);
  };

  return (
    <Card className="h-[70vh] flex flex-col bg-card text-foreground border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>Network Map</CardTitle>
          <CardDescription>Drag and drop devices to visualize your network layout.</CardDescription>
        </div>
        <Panel position="top-right" className="flex gap-2">
          {canManageDevices && (
            <>
              <Button onClick={handleAddDeviceClick} disabled={!canAddDevice || !mapId} title={!canAddDevice ? licenseMessage : (!mapId ? 'Select or create a map first' : 'Add a new device to the map')}>
                <PlusCircle className="h-4 w-4 mr-2" /> Add Device
              </Button>
              <Button onClick={handleSaveLayout} disabled={isSaving || !mapId}>
                <Save className="h-4 w-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Layout'}
              </Button>
              <AlertDialog open={isMapCreatorOpen} onOpenChange={setIsMapCreatorOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">Create New Map</Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card text-foreground border-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Create New Network Map</AlertDialogTitle>
                    <AlertDialogDescription>
                      Enter a name for your new network map.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="newMapName" className="text-right">
                        Map Name
                      </Label>
                      <Input
                        id="newMapName"
                        value={newMapName}
                        onChange={(e) => setNewMapName(e.target.value)}
                        className="col-span-3 bg-background text-foreground border-border"
                        placeholder="e.g., Main Office Network"
                      />
                    </div>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCreateMap}>Create Map</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              {mapId && (
                <Button variant="destructive" onClick={() => openMapDeletionAlert(mapId)}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete Current Map
                </Button>
              )}
            </>
          )}
        </Panel>
      </CardHeader>
      <CardContent className="flex-grow p-0" ref={reactFlowWrapper}>
        {mapId ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="bg-background rounded-b-lg"
          >
            <MiniMap />
            <Controls />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4">
            <NetworkIcon className="h-12 w-12 mx-auto mb-4" />
            <p className="text-center">Please select a map from the dropdown above or create a new one to start visualizing your network.</p>
          </div>
        )}
      </CardContent>

      <DeviceEditorDialog
        isOpen={isDeviceEditorOpen}
        onClose={() => setIsDeviceEditorOpen(false)}
        onSave={handleSaveDevice}
        device={editingDevice}
      />

      <AlertDialog open={isMapDeletionAlertOpen} onOpenChange={setIsMapDeletionAlertOpen}>
        <AlertDialogContent className="bg-card text-foreground border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" /> Confirm Map Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the map "{maps.find(m => m.id === mapToDeleteId)?.name}"?
              All devices currently assigned to this map will become unassigned (their map_id will be set to NULL). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMap} className="bg-destructive hover:bg-destructive/90">
              Delete Map
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

const NetworkMap = (props: NetworkMapProps) => (
  <ReactFlowProvider>
    <NetworkMapContent {...props} />
  </ReactFlowProvider>
);

export default NetworkMap;