"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NetworkDevice } from "@/services/networkDeviceService";

interface DeviceEditorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (device: Omit<NetworkDevice, 'id' | 'user_id' | 'status' | 'last_ping' | 'last_ping_result' | 'map_name' | 'last_ping_output'>) => Promise<void>;
  device?: Partial<NetworkDevice>; // Optional, for editing existing devices
}

export const DeviceEditorDialog = ({ isOpen, onClose, onSave, device }: DeviceEditorDialogProps) => {
  const [name, setName] = useState(device?.name || '');
  const [ipAddress, setIpAddress] = useState(device?.ip_address || '');
  const [type, setType] = useState(device?.type || 'server');
  const [description, setDescription] = useState(device?.description || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(device?.name || '');
      setIpAddress(device?.ip_address || '');
      setType(device?.type || 'server');
      setDescription(device?.description || '');
      setIsSaving(false);
    }
  }, [isOpen, device]);

  const handleSubmit = async () => {
    if (!name || !ipAddress || !type) {
      alert('Name, IP Address, and Type are required.');
      return;
    }
    setIsSaving(true);
    try {
      await onSave({ name, ip_address: ipAddress, type, description });
      onClose();
    } catch (error) {
      console.error("Failed to save device:", error);
      // Error message handled by onSave's toast
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card text-foreground border-border">
        <DialogHeader>
          <DialogTitle>{device ? 'Edit Device' : 'Add New Device'}</DialogTitle>
          <DialogDescription>
            {device ? 'Make changes to your device here.' : 'Add a new network device to monitor.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3 bg-background text-foreground border-border"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ip_address" className="text-right">
              IP Address
            </Label>
            <Input
              id="ip_address"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              className="col-span-3 bg-background text-foreground border-border"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select value={type} onValueChange={setType} required>
              <SelectTrigger className="col-span-3 bg-background text-foreground border-border">
                <SelectValue placeholder="Select device type" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground border-border">
                <SelectItem value="server">Server</SelectItem>
                <SelectItem value="router">Router</SelectItem>
                <SelectItem value="switch">Switch</SelectItem>
                <SelectItem value="workstation">Workstation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3 bg-background text-foreground border-border"
              placeholder="Optional description"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};