/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SystemAuditLog, AuditActionType, UserRole } from '../types/organogram';

const AUDIT_LOG_STORAGE_KEY = 'turag_system_audit_logs_v1';

const INITIAL_AUDIT_LOGS: SystemAuditLog[] = [
  {
    id: 'log-001',
    timestamp: '2026-10-30 08:30:12',
    timestampMs: Date.now() - 3600000 * 2,
    userId: 'admin',
    userName: 'Chief Administrator',
    userRole: 'admin',
    action: 'LOGIN',
    details: 'Administrator authenticated into Turag Admin Control Panel.',
    entityType: 'AUTH',
  },
  {
    id: 'log-002',
    timestamp: '2026-10-30 08:32:45',
    timestampMs: Date.now() - 3600000 * 1.9,
    userId: 'admin',
    userName: 'Chief Administrator',
    userRole: 'admin',
    action: 'VIEW',
    details: 'Viewed User ID & Password Library credential repository.',
    entityType: 'USER_ACCOUNT',
  },
  {
    id: 'log-003',
    timestamp: '2026-10-30 08:45:00',
    timestampMs: Date.now() - 3600000 * 1.8,
    userId: 'mgr_sewing',
    userName: 'Md. Arif Hossain (Sr. Manager)',
    userRole: 'manager',
    action: 'LOGIN',
    details: 'Sewing Department Manager logged in to Sewing operational workspace.',
    entityType: 'AUTH',
  },
  {
    id: 'log-004',
    timestamp: '2026-10-30 08:50:18',
    timestampMs: Date.now() - 3600000 * 1.7,
    userId: 'mgr_sewing',
    userName: 'Md. Arif Hossain (Sr. Manager)',
    userRole: 'manager',
    action: 'EDIT',
    details: 'Updated headcount for "Sewing Assistants" to 231 in Sewing Operation wing.',
    entityType: 'NODE',
    entityId: 'sew-assistants',
  },
  {
    id: 'log-005',
    timestamp: '2026-10-30 09:12:05',
    timestampMs: Date.now() - 3600000 * 1.5,
    userId: 'viewer',
    userName: 'Public Factory Viewer',
    userRole: 'public_viewer',
    action: 'LOGIN',
    details: 'Public guest accessed read-only hierarchy preview.',
    entityType: 'AUTH',
  },
  {
    id: 'log-006',
    timestamp: '2026-10-30 09:15:22',
    timestampMs: Date.now() - 3600000 * 1.4,
    userId: 'viewer',
    userName: 'Public Factory Viewer',
    userRole: 'public_viewer',
    action: 'UNAUTHORIZED_ATTEMPT',
    details: 'Blocked attempt to edit reporting node "dept-cutting" without admin privileges.',
    entityType: 'NODE',
    entityId: 'dept-cutting',
  },
];

export function getStoredAuditLogs(): SystemAuditLog[] {
  try {
    const raw = localStorage.getItem(AUDIT_LOG_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return INITIAL_AUDIT_LOGS;
}

export function saveAuditLogs(logs: SystemAuditLog[]): void {
  try {
    localStorage.setItem(AUDIT_LOG_STORAGE_KEY, JSON.stringify(logs.slice(0, 500))); // Keep last 500
  } catch {
    // ignore
  }
}

export function createAuditLogEntry(
  entry: Omit<SystemAuditLog, 'id' | 'timestamp' | 'timestampMs'>
): SystemAuditLog {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const formattedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
    now.getHours()
  )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  return {
    ...entry,
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: formattedDate,
    timestampMs: Date.now(),
  };
}

export function exportAuditLogsToCsv(logs: SystemAuditLog[]): void {
  const headers = ['Timestamp', 'Action', 'User ID', 'User Name', 'Role', 'Entity Type', 'Details'];
  const rows = logs.map((l) => [
    `"${l.timestamp}"`,
    `"${l.action}"`,
    `"${l.userId}"`,
    `"${l.userName.replace(/"/g, '""')}"`,
    `"${l.userRole}"`,
    `"${l.entityType || ''}"`,
    `"${l.details.replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Turag_Security_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
