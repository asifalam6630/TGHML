/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserAccount } from '../types/organogram';

const USER_LIB_STORAGE_KEY = 'turag_user_password_library_v1';

export const INITIAL_USER_LIBRARY: UserAccount[] = [
  {
    id: 'usr-001',
    userId: 'admin',
    name: 'Chief Administrator',
    role: 'admin',
    password: 'admin2026!',
    department: 'Corporate Governance',
    isActive: true,
    createdDate: '2025-01-15',
    lastLogin: '2026-10-30 08:30 AM',
  },
  {
    id: 'usr-002',
    userId: 'hr_director',
    name: 'Head of HR & Admin (AFWL-AHL)',
    role: 'admin',
    password: 'turagHR#2026',
    department: 'Admin & HR',
    isActive: true,
    createdDate: '2025-02-01',
    lastLogin: '2026-10-29 04:15 PM',
  },
  {
    id: 'usr-003',
    userId: 'mgr_sewing',
    name: 'Md. Arif Hossain (Sr. Manager)',
    role: 'manager',
    password: 'sewing2026',
    department: 'Sewing',
    isActive: true,
    createdDate: '2025-03-10',
    lastLogin: '2026-10-28 11:20 AM',
  },
  {
    id: 'usr-004',
    userId: 'mgr_cutting',
    name: 'Md. Hamidul Islam (Manager)',
    role: 'manager',
    password: 'cutting2026',
    department: 'Cutting',
    isActive: true,
    createdDate: '2025-03-12',
    lastLogin: '2026-10-27 09:45 AM',
  },
  {
    id: 'usr-005',
    userId: 'mgr_qc',
    name: 'Md. Shakawat Hossain (Asst. Manager)',
    role: 'manager',
    password: 'quality2026',
    department: 'Quality Control',
    isActive: true,
    createdDate: '2025-03-20',
    lastLogin: '2026-10-25 02:10 PM',
  },
  {
    id: 'usr-006',
    userId: 'viewer',
    name: 'Public Factory Viewer',
    role: 'public_viewer',
    password: 'viewer123',
    department: 'All Departments',
    isActive: true,
    createdDate: '2025-04-01',
    lastLogin: '2026-10-30 05:00 AM',
  },
];

export function getStoredUserLibrary(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USER_LIB_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return INITIAL_USER_LIBRARY;
}

export function saveUserLibrary(users: UserAccount[]): void {
  try {
    localStorage.setItem(USER_LIB_STORAGE_KEY, JSON.stringify(users));
  } catch {
    // quota ignore
  }
}
