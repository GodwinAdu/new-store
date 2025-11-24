'use client'

import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/actions/auth.actions';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  permissions: Record<string, boolean>;
}

interface PermissionGuardProps {
  permission?: string;
  role?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function PermissionGuard({ 
  permission, 
  role, 
  children, 
  fallback = null 
}: PermissionGuardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>;
  }

  if (!user) {
    return fallback;
  }

  // Check role
  if (role && user.role !== role && user.role !== 'admin') {
    return fallback;
  }

  // Check permission
  if (permission && !user.permissions[permission] && user.role !== 'admin') {
    return fallback;
  }

  return <>{children}</>;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const hasPermission = (permission: string) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions[permission] === true;
  };

  const hasRole = (role: string) => {
    if (!user) return false;
    return user.role === role || user.role === 'admin';
  };

  return {
    user,
    loading,
    hasPermission,
    hasRole,
    isAuthenticated: !!user
  };
}