"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  Wifi,
  Server,
  Clock,
  RefreshCw,
  Network,
  Key,
  Users,
  Package,
  Settings,
  Map,
  WifiOff,
  Desktop, // Added for Server Ping icon
  Search, // Added for Network Scanner icon
  History, // Added for Ping History icon
  ShieldHalf, // Added for License icon
  BoxOpen, // Added for Products icon
  UserCog, // Added for Users icon
  Tools, // Added for Maintenance icon
  PlusCircle, // Added for Create New Device button
  AlertCircle, // Added for license limit warning
} from "lucide-react";
import PingTest from "@/components/PingTest";
import NetworkStatus from "@/components/NetworkStatus";
import NetworkScanner from "@/components/NetworkScanner";
import ServerPingTest from "@/components/ServerPingTest";
import PingHistory from "@/components/PingHistory";
import { MadeWithDyad } from "@/components/made-with-dyad";
import NetworkMap from "@/components/NetworkMap";
import { getLicenseStatus, LicenseStatus, User, addDevice, NetworkDevice } from "@/services/networkDeviceService";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardContent from "@/components/DashboardContent";
import { useDashboardData } from "@/hooks/useDashboardData";
import LicenseManager from "@/components/LicenseManager"; // Keep import for LicenseManager as it's used by LicenseDetailsPage
import UserManagement from "@/components/UserManagement";
import DockerUpdate from "@/components/DockerUpdate";
import ProductsPage from "./Products"; // Renamed to ProductsPage to avoid conflict with component
import Maintenance from "./Maintenance";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Ensure Card components are imported
import { Button } from "@/components/ui/button"; // Ensure Button is imported
import { Badge } from "@/components/ui/badge"; // Ensure Badge is imported
import { DeviceEditorDialog } from "@/components/DeviceEditorDialog"; // Import DeviceEditorDialog
import { showSuccess, showError } from "@/utils/toast"; // Import toast utilities
import LicenseDetailsPage from "./LicenseDetailsPage"; // Import the new LicenseDetailsPage

// Helper to get initial tab from URL hash
const getInitialTab = () => {
  const hash = window.location.hash.substring(1);
  const validTabs = [
    "dashboard", "devices", "ping", "server-ping", "status", "scanner", 
    "history", "map", "license", "products", "users", "maintenance",
  ];
  if (validTabs.includes(hash)) {
    return hash;
  }
  return "dashboard";
};

const MainApp = () => {
  const {
    maps,
    currentMapId,
    setCurrentMapId,
    devices,
    dashboardStats,
    recentActivity,
    isLoading: isDashboardLoading,
    fetchMaps,
    fetchDashboardData,
  } = useDashboardData();

  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus>({
    app_license_key: "",
    can_add_device: false,
    max_devices: 0,
    license_message: "Loading license status...",
    license_status_code: "unknown",
    license_grace_period_end: null,
    installation_id: "",
  });
  const [userRole, setUserRole] = useState<User["role"]>("read_user"); // Default to 'read_user'
  const [isUserRoleLoading, setIsUserRoleLoading] = useState(true);
  const [isLicenseStatusLoading, setIsLicenseStatusLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(getInitialTab());

  // State for DeviceEditorDialog
  const [isDeviceEditorOpen, setIsDeviceEditorOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Partial<NetworkDevice> | undefined>(undefined);

  const fetchLicenseStatus = useCallback(async () => {
    setIsLicenseStatusLoading(true);
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
      setIsLicenseStatusLoading(false);
    }
  }, []);

  const fetchUserRole = useCallback(async () => {
    setIsUserRoleLoading(true);
    try {
      const response = await fetch('/api.php?action=get_user_info'); 
      if (response.ok) {
        const data = await response.json();
        setUserRole(data.role);
      } else {
        setUserRole('read_user'); // Fallback to read_user if API fails
      }
    } catch (error) {
      console.error("Failed to fetch user role:", error);
      setUserRole('read_user'); 
    } finally {
      setIsUserRoleLoading(false);
    }
  }, []);

  const isAdmin = useMemo(() => userRole === "admin", [userRole]);
  const canManageDevices = useMemo(() => userRole === "admin" || userRole === "network_manager", [userRole]);
  const isAppLoading = isUserRoleLoading || isLicenseStatusLoading;

  useEffect(() => {
    fetchUserRole();
    fetchLicenseStatus();
  }, [fetchUserRole, fetchLicenseStatus]);

  useEffect(() => {
    // Fetch dashboard data only after we know the license status and user role
    if (!isAppLoading) {
      fetchDashboardData();
      fetchMaps();
    }
  }, [isAppLoading, fetchDashboardData, fetchMaps]);

  // Update URL hash when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.location.hash = value;
  };

  // Listen for hash changes (e.g., back button)
  useEffect(() => {
    const handleHashChange = () => {
      setActiveTab(getInitialTab());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Log debug info to console
  useEffect(() => {
    console.log("Debug Info:");
    console.log("  User Role:", userRole);
    console.log("  License Status Code:", licenseStatus.license_status_code);
    console.log("  Can Add Device:", licenseStatus.can_add_device);
    console.log("  License Message:", licenseStatus.license_message);
  }, [userRole, licenseStatus]);

  const handleAddDeviceClick = () => {
    if (!licenseStatus.can_add_device) {
      showError(licenseStatus.license_message || 'You have reached your device limit.');
      return;
    }
    setEditingDevice(undefined); // Clear any previous editing state
    setIsDeviceEditorOpen(true);
  };

  const handleSaveNewDevice = async (deviceData: Omit<NetworkDevice, 'id' | 'user_id' | 'position_x' | 'position_y' | 'status' | 'last_ping' | 'last_ping_result' | 'map_name' | 'last_ping_output'>) => {
    try {
      await addDevice({ ...deviceData, position_x: 0, position_y: 0, map_id: currentMapId }); // Default position and map_id
      showSuccess('Device added successfully.');
      fetchDashboardData(); // Refresh the device list
      fetchLicenseStatus(); // Re-fetch license status to update device count
    } catch (error: any) {
      showError(error.message || 'Failed to add device.');
    }
  };

  if (isAppLoading) {
    return (
      <div className="flex w-full flex-col items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg text-muted-foreground">Loading application data...</p>
        <p className="text-sm text-muted-foreground mt-2">Fetching user permissions and license status.</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col">
      <div className="flex-1 space-y-4 p-4 pt-6 sm:p-8">
        {/* Temporary debug display for user role and license status */}
        <div className="bg-blue-500/20 text-blue-300 p-2 rounded-md text-sm mb-4">
          Debug: Current User Role: <span className="font-bold capitalize">{userRole}</span> | 
          License Status: <span className="font-bold capitalize">{licenseStatus.license_status_code}</span> |
          Can Add Device: <span className="font-bold capitalize">{licenseStatus.can_add_device ? 'Yes' : 'No'}</span>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="flex flex-wrap h-auto p-1">
            <TabsTrigger value="dashboard">
              <Activity className="mr-2 h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="devices">
              <Server className="mr-2 h-4 w-4" />
              Devices
            </TabsTrigger>
            <TabsTrigger value="ping">
              <Wifi className="mr-2 h-4 w-4" />
              Browser Ping
            </TabsTrigger>
            <TabsTrigger value="server-ping">
              <Desktop className="mr-2 h-4 w-4" />
              Server Ping
            </TabsTrigger>
            <TabsTrigger value="status">
              <Network className="mr-2 h-4 w-4" />
              Network Status
            </TabsTrigger>
            <TabsTrigger value="scanner">
              <Search className="mr-2 h-4 w-4" />
              Network Scanner
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="mr-2 h-4 w-4" />
              Ping History
            </TabsTrigger>
            <TabsTrigger value="map">
              <Map className="mr-2 h-4 w-4" />
              Network Map
            </TabsTrigger>
            <TabsTrigger value="license">
              <ShieldHalf className="mr-2 h-4 w-4" />
              License
            </TabsTrigger>
            <TabsTrigger value="products">
              <BoxOpen className="mr-2 h-4 w-4" />
              Products
            </TabsTrigger>
            {isAdmin && (
              <>
                <TabsTrigger value="users">
                  <UserCog className="mr-2 h-4 w-4" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="maintenance">
                  <Tools className="mr-2 h-4 w-4" />
                  Maintenance
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardContent
              maps={maps}
              currentMapId={currentMapId}
              setCurrentMapId={setCurrentMapId}
              devices={devices}
              dashboardStats={dashboardStats}
              recentActivity={recentActivity}
              isLoading={isDashboardLoading}
              fetchMaps={fetchMaps}
              fetchDashboardData={fetchDashboardData}
              licenseStatus={licenseStatus}
              fetchLicenseStatus={fetchLicenseStatus}
            />
          </TabsContent>

          <TabsContent value="devices">
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
                      disabled={!licenseStatus.can_add_device}
                      title={!licenseStatus.can_add_device ? licenseStatus.license_message : 'Add a new device to your inventory'}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create New Device
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {isDashboardLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-lg" />
                    ))}
                  </div>
                ) : devices.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Server className="h-12 w-12 mx-auto mb-4" />
                    <p>No devices found. Add devices to start monitoring.</p>
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
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ping">
            <PingTest />
          </TabsContent>

          <TabsContent value="server-ping">
            <ServerPingTest />
          </TabsContent>

          <TabsContent value="status">
            <NetworkStatus />
          </TabsContent>

          <TabsContent value="scanner">
            <NetworkScanner />
          </TabsContent>

          <TabsContent value="history">
            <PingHistory />
          </TabsContent>

          <TabsContent value="map">
            <div className="flex items-center gap-2 mb-4">
              <label htmlFor="map-select" className="text-sm font-medium text-muted-foreground">Select Map:</label>
              <select
                id="map-select"
                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={currentMapId || ''}
                onChange={(e) => setCurrentMapId(e.target.value)}
              >
                {maps.length === 0 ? (
                  <option value="">No maps available</option>
                ) : (
                  maps.map((map) => (
                    <option key={map.id} value={map.id}>
                      {map.name}
                    </option>
                  ))
                )}
              </select>
              <Button onClick={fetchMaps} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            {currentMapId ? (
              <NetworkMap 
                devices={devices} 
                onMapUpdate={fetchDashboardData}
                mapId={currentMapId} 
                canAddDevice={licenseStatus.can_add_device}
                licenseMessage={licenseStatus.license_message}
                userRole={userRole}
              />
            ) : (
              <Card className="h-[70vh] flex items-center justify-center">
                <CardContent className="text-center">
                  <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No map selected or available. Please create one in the PHP frontend or select an existing one.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="license">
            <LicenseDetailsPage /> {/* Render the new LicenseDetailsPage here */}
          </TabsContent>
          
          <TabsContent value="products">
            <ProductsPage /> {/* Render the updated ProductsPage here */}
          </TabsContent>

          {isAdmin && (
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="maintenance">
              <Maintenance />
            </TabsContent>
          )}
        </Tabs>

        <MadeWithDyad />
      </div>

      {/* Device Editor Dialog */}
      <DeviceEditorDialog
        isOpen={isDeviceEditorOpen}
        onClose={() => setIsDeviceEditorOpen(false)}
        onSave={handleSaveNewDevice}
        device={editingDevice} // Will be undefined for new device
      />
    </div>
  );
};

export default MainApp;