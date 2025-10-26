"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users, UserPlus, UserCog, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'network_manager' | 'read_user';
}

const UserManagement = () => {
  const [users, setUsers] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [newUser, setNewUser] = React.useState({ username: '', email: '', password: '', role: 'read_user' as User['role'] });

  React.useEffect(() => {
    // Simulate fetching users
    const fetchUsers = setTimeout(() => {
      setUsers([
        { id: '1', username: 'admin', email: 'admin@example.com', role: 'admin' },
        { id: '2', username: 'john.doe', email: 'john.doe@example.com', role: 'network_manager' },
        { id: '3', username: 'jane.smith', email: 'jane.smith@example.com', role: 'read_user' },
      ]);
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(fetchUsers);
  }, []);

  const handleAddUser = () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      showError("Username, email, and password are required.");
      return;
    }
    // Simulate API call
    const newId = String(users.length + 1);
    setUsers([...users, { ...newUser, id: newId }]);
    showSuccess(`User '${newUser.username}' added.`);
    setNewUser({ username: '', email: '', password: '', role: 'read_user' });
  };

  const handleUpdateRole = (id: string, newRole: User['role']) => {
    setUsers(users.map(user => user.id === id ? { ...user, role: newRole } : user));
    showSuccess(`User role updated.`);
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
    showSuccess(`User deleted.`);
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
              />
              <Input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="bg-background text-foreground border-border"
              />
              <Input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="bg-background text-foreground border-border"
              />
              <Select value={newUser.role} onValueChange={(value: User['role']) => setNewUser({ ...newUser, role: value })}>
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
            <Button onClick={handleAddUser} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              <UserPlus className="h-4 w-4 mr-2" /> Add User
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Existing Users</h3>
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