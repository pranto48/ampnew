"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users, UserPlus, UserCog, Trash2, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { User, getUsers, addUser, updateUserRole, deleteUser } from "@/services/networkDeviceService";

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'read_user' as User['role'] });

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
      showSuccess("Users loaded successfully.");
    } catch (error: any) {
      showError(error.message || "Failed to load users.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      showError("Username, email, and password are required.");
      return;
    }
    setIsAddingUser(true);
    try {
      await addUser(newUser.username, newUser.email, newUser.password, newUser.role);
      showSuccess(`User '${newUser.username}' added.`);
      setNewUser({ username: '', email: '', password: '', role: 'read_user' });
      fetchUsers(); // Refresh the user list
    } catch (error: any) {
      showError(error.message || "Failed to add user.");
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleUpdateRole = async (id: string, newRole: User['role']) => {
    try {
      await updateUserRole(id, newRole);
      showSuccess(`User role updated.`);
      fetchUsers(); // Refresh the user list
    } catch (error: any) {
      showError(error.message || "Failed to update user role.");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }
    try {
      await deleteUser(id);
      showSuccess(`User deleted.`);
      fetchUsers(); // Refresh the user list
    } catch (error: any) {
      showError(error.message || "Failed to delete user.");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card text-foreground border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>
            Manage application users, roles, and access permissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Add New User</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Username"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                className="bg-background text-foreground border-border"
                disabled={isAddingUser}
              />
              <Input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="bg-background text-foreground border-border"
                disabled={isAddingUser}
              />
              <Input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="bg-background text-foreground border-border"
                disabled={isAddingUser}
              />
              <Select value={newUser.role} onValueChange={(value: User['role']) => setNewUser({ ...newUser, role: value })} disabled={isAddingUser}>
                <SelectTrigger className="bg-background text-foreground border-border">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border-border">
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="network_manager">Network Manager</SelectItem>
                  <SelectItem value="read_user">Read-Only User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddUser} disabled={isAddingUser} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              {isAddingUser ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
              {isAddingUser ? 'Adding User...' : 'Add User'}
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center justify-between">
              Existing Users
              <Button onClick={fetchUsers} disabled={isLoading} variant="outline" size="sm">
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </h3>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            ) : users.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No users found.</p>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-lg bg-background">
                    <div className="flex-1 mb-2 md:mb-0">
                      <p className="font-medium text-foreground">{user.username} ({user.email})</p>
                      <p className="text-sm text-muted-foreground capitalize">Role: {user.role.replace('_', ' ')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={user.role} onValueChange={(value: User['role']) => handleUpdateRole(user.id, value)}>
                        <SelectTrigger className="w-[180px] bg-background text-foreground border-border">
                          <SelectValue placeholder="Change Role" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover text-popover-foreground border-border">
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="network_manager">Network Manager</SelectItem>
                          <SelectItem value="read_user">Read-Only User</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteUser(user.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;