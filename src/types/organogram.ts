/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EmployeeBand = 
  | 'GM Band' 
  | 'Manager Band' 
  | 'Executive Band' 
  | 'Officer Band' 
  | 'Operator Band';

export type UserRole = 'admin' | 'manager' | 'public_viewer';

export interface UserAccount {
  id: string;
  userId: string; // login identifier e.g. admin or mgr_sewing
  name: string;
  role: UserRole;
  password: string; // Plaintext for library view/editing strictly by admin
  department?: string; // e.g. 'All' or 'Sewing'
  isActive: boolean;
  createdDate: string;
  lastLogin?: string;
  avatarUrl?: string;
}

export interface OrgNodeData {
  id: string;
  name?: string; // Optional name of the person (e.g., Md. Arif Hossain)
  title: string; // Designation / Role (e.g. Sr. Manager, Sr. Executive, Quality Inspector)
  department: string; // e.g. Sewing, Cutting, Quality Control, Utility, Admin & HR
  subDepartment?: string; // e.g. Pre-Cutting, Cutting Execution, Sewing Operation
  reportsTo: string | null; // ID of parent manager node
  band: EmployeeBand;
  levelNumber: number; // 0 for BOD, 1 for DGM/GM, 2 for Manager, 3 for Executive, 4 for Officer/Operator
  headcount?: string; // e.g. "1", "1-8", "231", "100"
  phone?: string; // e.g. 01712915967
  email?: string;
  location?: string;
  notes?: string;
  isCollapsed?: boolean;
}

export interface HierarchyNode extends OrgNodeData {
  children: HierarchyNode[];
  directReportsCount: number;
  totalTeamCount: number;
  depth: number;
  x?: number;
  y?: number;
}

export interface OrgDataset {
  id: string;
  name: string;
  code: string;
  version: string;
  date: string;
  approvedBy: string;
  instructionalDesign: string;
  pdfPath?: string;
  nodes: OrgNodeData[];
}

export interface ManpowerAreaSummary {
  department: string;
  rolesCount: number;
  totalHeadcountMin: number;
  totalHeadcountMax: number;
  gmCount: number;
  managerCount: number;
  execCount: number;
  officerCount: number;
  operatorCount: number;
  keyLeader?: string;
  phone?: string;
  subDepartments: string[];
}

export interface GoogleDriveFileItem {
  id: string;
  name: string;
  fileId: string;
  shareUrl: string;
  format: 'PDF' | 'CSV' | 'VISIO' | 'JSON';
  lastModified: string;
  status: 'synced' | 'available' | 'error';
  description: string;
  nodeCountEstimate?: number;
}

export type AuditActionType = 
  | 'LOGIN'
  | 'LOGOUT'
  | 'VIEW'
  | 'CREATE'
  | 'EDIT'
  | 'DELETE'
  | 'UNAUTHORIZED_ATTEMPT'
  | 'PASSWORD_CHANGE'
  | 'USER_MANAGEMENT';

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  timestampMs: number;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: AuditActionType;
  details: string;
  entityType?: 'AUTH' | 'NODE' | 'MANPOWER' | 'USER_ACCOUNT' | 'DATASET';
  entityId?: string;
}
