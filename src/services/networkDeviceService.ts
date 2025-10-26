const API_BASE_URL = '/api.php'; // Assuming your AMPNM app's API is at /api.php

export interface NetworkDevice {
  id: string;
  name: string;
  ip_address: string;
  type: string; // e.g., 'server', 'router', 'switch', 'workstation'
  description?: string;
  status: 'online' | 'offline' | 'unknown';
  last_ping: string; // ISO date string
  last_ping_result: string;
  last_ping_output?: string;
  map_id: string; // ID of the map it belongs to
  position_x: number;
  position_y: number;
  user_id: string; // Owner of the device
}

export interface NetworkMap {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface LicenseStatus {
  app_license_key: string;
  can_add_device: boolean;
  max_devices: number;
  license_message: string;
  license_status_code: string;
  license_grace_period_end: string | null;
  installation_id: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'network_manager' | 'read_user';
}

const callApi = async (action: string, method: 'GET' | 'POST', params?: Record<string, any>, body?: any) => {
  const options: RequestInit = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const queryString = params ? `&${new URLSearchParams(params).toString()}` : '';
  const response = await fetch(`${API_BASE_URL}?action=${action}${queryString}`, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// --- Network Device Functions ---
export const getNetworkDevices = async (mapId: string | null = null): Promise<NetworkDevice[]> => {
  const params: Record<string, any> = {};
  if (mapId) {
    params.map_id = mapId;
  }
  const data = await callApi('get_network_devices', 'GET', params);
  if (data.success && Array.isArray(data.devices)) {
    return data.devices.map((d: any) => ({
      ...d,
      id: String(d.id),
      map_id: String(d.map_id),
      position_x: parseFloat(d.position_x),
      position_y: parseFloat(d.position_y),
    })) as NetworkDevice[];
  }
  throw new Error("Failed to retrieve network devices.");
};

export const addDevice = async (device: Omit<NetworkDevice, 'id' | 'status' | 'last_ping' | 'last_ping_result' | 'last_ping_output'>): Promise<NetworkDevice> => {
  const data = await callApi('add_device', 'POST', undefined, device);
  if (data.success && data.device) {
    return {
      ...data.device,
      id: String(data.device.id),
      map_id: String(data.device.map_id),
      position_x: parseFloat(data.device.position_x),
      position_y: parseFloat(data.device.position_y),
    } as NetworkDevice;
  }
  throw new Error(data.error || "Failed to add device.");
};

export const updateDevicePosition = async (updates: Array<{ id: string; position_x: number; position_y: number; name?: string; ip_address?: string; type?: string; description?: string; map_id?: string; }>): Promise<void> => {
  const data = await callApi('update_device_position', 'POST', undefined, { updates });
  if (!data.success) {
    throw new Error(data.error || "Failed to update device positions.");
  }
};

// --- Network Map Functions ---
export const getMaps = async (): Promise<NetworkMap[]> => {
  const data = await callApi('get_maps', 'GET');
  if (data.success && Array.isArray(data.maps)) {
    return data.maps.map((m: any) => ({
      ...m,
      id: String(m.id),
    })) as NetworkMap[];
  }
  throw new Error("Failed to retrieve network maps.");
};

export const createMap = async (name: string): Promise<NetworkMap> => {
  const data = await callApi('create_map', 'POST', undefined, { name });
  if (data.success && data.map) {
    return {
      ...data.map,
      id: String(data.map.id),
    } as NetworkMap;
  }
  throw new Error(data.error || "Failed to create map.");
};

export const updateMap = async (mapId: string, name: string): Promise<NetworkMap> => {
  const data = await callApi('update_map', 'POST', undefined, { id: mapId, name });
  if (data.success && data.map) {
    return {
      ...data.map,
      id: String(data.map.id),
    } as NetworkMap;
  }
  throw new Error(data.error || "Failed to update map.");
};

// --- License Status Functions ---
export const getLicenseStatus = async (): Promise<LicenseStatus> => {
  const data = await callApi('get_license_status', 'GET');
  if (data.success && data.license_status) {
    return data.license_status as LicenseStatus;
  }
  throw new Error(data.error || "Failed to retrieve license status.");
};

export const setAppLicenseKey = async (licenseKey: string): Promise<void> => {
  const data = await callApi('set_app_license_key', 'POST', undefined, { license_key: licenseKey });
  if (!data.success) {
    throw new Error(data.error || "Failed to set application license key.");
  }
};

// --- User Info Functions ---
export const getUserInfo = async (): Promise<User> => {
  const data = await callApi('get_user_info', 'GET');
  if (data.success && data.user) {
    return data.user as User;
  }
  throw new Error(data.error || "Failed to retrieve user information.");
};

// --- User Management Functions (NEW) ---
export const getUsers = async (): Promise<User[]> => {
  const data = await callApi('get_users', 'GET');
  if (data.success && Array.isArray(data.users)) {
    return data.users.map((u: any) => ({
      ...u,
      id: String(u.id),
    })) as User[];
  }
  throw new Error(data.error || "Failed to retrieve users.");
};

export const addUser = async (username: string, email: string, password: string, role: User['role']): Promise<User> => {
  const data = await callApi('add_user', 'POST', undefined, { username, email, password, role });
  if (data.success && data.user) {
    return {
      ...data.user,
      id: String(data.user.id),
    } as User;
  }
  throw new Error(data.error || "Failed to add user.");
};

export const updateUserRole = async (id: string, role: User['role']): Promise<User> => {
  const data = await callApi('update_user_role', 'POST', undefined, { id, role });
  if (data.success && data.user) {
    return {
      ...data.user,
      id: String(data.user.id),
    } as User;
  }
  throw new Error(data.error || "Failed to update user role.");
};

export const deleteUser = async (id: string): Promise<void> => {
  const data = await callApi('delete_user', 'POST', undefined, { id });
  if (!data.success) {
    throw new Error(data.error || "Failed to delete user.");
  }
};