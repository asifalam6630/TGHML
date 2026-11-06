/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  OrgDataset, 
  OrgNodeData, 
  HierarchyNode, 
  UserAccount,
  UserRole,
  SystemAuditLog,
  AuditActionType,
  JobDescription,
  JDResolutionResult
} from './types/organogram';
import { 
  INITIAL_PRESETS, 
  AFWL_MASTER_DATASET 
} from './data/afwlOrgData';
import { 
  getStoredUserLibrary, 
  saveUserLibrary, 
  INITIAL_USER_LIBRARY 
} from './data/userLibrary';
import { 
  getStoredAuditLogs, 
  saveAuditLogs, 
  createAuditLogEntry 
} from './data/auditLog';
import { 
  getStoredJDs, 
  saveJDs 
} from './data/jobDescriptions';
import { 
  buildHierarchyTree, 
  willCreateCycle, 
  exportToCSV 
} from './utils/treeUtils';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { OrgCanvas } from './components/OrgCanvas';
import { DepartmentGridView } from './components/DepartmentGridView';
import { RosterTableView } from './components/RosterTableView';
import { ManpowerSummaryView } from './components/ManpowerSummaryView';
import { JDManagementDashboard } from './components/JDManagementDashboard';
import { JDPdfViewerModal } from './components/JDPdfViewerModal';
import { JDUploadAssignModal } from './components/JDUploadAssignModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { FileUploadModal } from './components/FileUploadModal';
import { PdfViewerModal } from './components/PdfViewerModal';
import { NodeDetailDrawer } from './components/NodeDetailDrawer';
import { LoginModal } from './components/LoginModal';
import { UserLibraryModal } from './components/UserLibraryModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { AuditLogModal } from './components/AuditLogModal';
import { GoogleDriveLoaderModal } from './components/GoogleDriveLoaderModal';
import { 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Shield, 
  Eye, 
  Key, 
  UploadCloud, 
  HardDrive, 
  Target, 
  ShieldAlert,
  LogOut,
  ChevronUp,
  ChevronDown,
  FileText
} from 'lucide-react';

const STORAGE_KEY = 'turag_custom_datasets_v3';
const ACTIVE_DS_KEY = 'turag_active_ds_id_v3';
const CURRENT_USER_KEY = 'turag_current_user_v3';
const AUTH_SESSION_KEY = 'turag_authenticated_session_v3';

export default function App() {
  // User Accounts Library
  const [users, setUsers] = useState<UserAccount[]>(() => getStoredUserLibrary());

  // Security & Activity Audit Logs (Stored and strictly Admin-visible)
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>(() => getStoredAuditLogs());

  // Authentication state: False by default so visitor sees the Login Interface first
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(AUTH_SESSION_KEY) === 'true';
  });

  // Current Logged In User
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const match = users.find((u) => u.id === parsed.id || u.userId === parsed.userId);
        if (match) return match;
      }
    } catch {
      // fallback
    }
    return users[0] || INITIAL_USER_LIBRARY[0];
  });

  const isAdmin = currentUser.role === 'admin';
  const isManager = currentUser.role === 'manager';
  const isManagerOrAdmin = isAdmin || isManager;

  // Audit Logger helper
  const logEvent = useCallback(
    (
      action: AuditActionType,
      details: string,
      entityType?: 'AUTH' | 'NODE' | 'MANPOWER' | 'USER_ACCOUNT' | 'DATASET' | 'JOB_DESCRIPTION',
      entityId?: string
    ) => {
      const newEntry = createAuditLogEntry({
        userId: currentUser.userId,
        userName: currentUser.name,
        userRole: currentUser.role,
        action,
        details,
        entityType,
        entityId,
      });

      setAuditLogs((prev) => {
        const updated = [newEntry, ...prev];
        saveAuditLogs(updated);
        return updated;
      });
    },
    [currentUser]
  );

  // Load datasets
  const [allDatasets, setAllDatasets] = useState<OrgDataset[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return INITIAL_PRESETS;
  });

  // Active dataset ID
  const [currentDatasetId, setCurrentDatasetId] = useState<string>(() => {
    const saved = localStorage.getItem(ACTIVE_DS_KEY);
    return saved || 'afwl-master';
  });

  // Current active dataset
  const currentDataset = useMemo(() => {
    return allDatasets.find((d) => d.id === currentDatasetId) || allDatasets[0] || AFWL_MASTER_DATASET;
  }, [allDatasets, currentDatasetId]);

  // Current dataset nodes
  const [nodes, setNodes] = useState<OrgNodeData[]>(() => currentDataset.nodes);

  // Sync nodes when dataset changes
  useEffect(() => {
    setNodes(currentDataset.nodes);
    const initialCollapsed = new Set<string>();
    currentDataset.nodes.forEach((n) => {
      if (n.levelNumber >= 3) {
        initialCollapsed.add(n.id);
      }
    });
    setCollapsedIds(initialCollapsed);
  }, [currentDatasetId]);

  // Active view: tree | departments | table | manpower | jd_management
  const [activeView, setActiveView] = useState<'tree' | 'departments' | 'table' | 'manpower' | 'jd_management'>('tree');
  // Department-wise filter for Interactive Tree
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>('all');

  // Application Theme State ('light' | 'dark' | 'system')
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    try {
      const saved = localStorage.getItem('turag_app_theme');
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    } catch {}
    return 'light'; // Clean light/white default
  });

  // Apply dark mode class to document element on theme changes
  useEffect(() => {
    const applyTheme = () => {
      const isDark =
        theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();
    try {
      localStorage.setItem('turag_app_theme', theme);
    } catch {}

    if (theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, [theme]);

  // Ensure non-admin users cannot remain on or access jd_management view
  useEffect(() => {
    if (activeView === 'jd_management' && !isAdmin) {
      setActiveView('tree');
    }
  }, [activeView, isAdmin]);

  // Job Description (JD) Management System State
  const [jds, setJds] = useState<JobDescription[]>(() => getStoredJDs());
  const [isJDPdfModalOpen, setIsJDPdfModalOpen] = useState(false);
  const [selectedJDForPdf, setSelectedJDForPdf] = useState<JobDescription | null>(null);
  const [selectedJDPriorityInfo, setSelectedJDPriorityInfo] = useState<{
    level: number;
    label: string;
    ruleDescription: string;
    isConflict?: boolean;
  } | undefined>(undefined);
  const [selectedJDEmployeeContext, setSelectedJDEmployeeContext] = useState<{
    id: string;
    name?: string;
    title: string;
    department: string;
    brand?: string;
    reportingManagerName?: string;
  } | undefined>(undefined);
  const [isJDUploadModalOpen, setIsJDUploadModalOpen] = useState(false);
  const [editingJD, setEditingJD] = useState<JobDescription | null>(null);

  // Compact Corner Floating Manager Panel Toggle
  const [isManagerPanelExpanded, setIsManagerPanelExpanded] = useState(false);

  // Collapsed branches state
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => {
    const set = new Set<string>();
    AFWL_MASTER_DATASET.nodes.forEach((n) => {
      if (n.levelNumber >= 3) set.add(n.id);
    });
    return set;
  });

  // Selected node for detail drawer
  const [selectedNode, setSelectedNode] = useState<OrgNodeData | null>(null);

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUserLibModalOpen, setIsUserLibModalOpen] = useState(false);
  const [isGoogleDriveModalOpen, setIsGoogleDriveModalOpen] = useState(false);
  const [isAuditLogModalOpen, setIsAuditLogModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  // Admin edit / add modal state
  const [adminModalMode, setAdminModalMode] = useState<'add' | 'edit'>('edit');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminParentNode, setAdminParentNode] = useState<OrgNodeData | null>(null);
  const [adminEditNode, setAdminEditNode] = useState<OrgNodeData | null>(null);

  // Feedback toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Login handler
  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

    // Record Login in Audit Log
    const loginEntry = createAuditLogEntry({
      userId: user.userId,
      userName: user.name,
      userRole: user.role,
      action: 'LOGIN',
      details: `${user.name} (${user.userId}) logged in with ${user.role.toUpperCase()} privileges.`,
      entityType: 'AUTH',
    });
    setAuditLogs((prev) => {
      const updated = [loginEntry, ...prev];
      saveAuditLogs(updated);
      return updated;
    });

    showToast(`Welcome, ${user.name}! Access level: ${user.role.toUpperCase()}`);

    if (user.role === 'manager' && user.department && user.department !== 'All') {
      const match = nodes.find((n) => n.department.toLowerCase() === user.department?.toLowerCase());
      if (match) setSelectedNode(match);
    }
  };

  // Guest Explorer access handler
  const handleGuestAccess = () => {
    const guestUser: UserAccount = {
      id: 'guest-preview',
      userId: 'guest_viewer',
      name: 'Public Guest Explorer',
      role: 'public_viewer',
      password: '',
      department: 'All Departments',
      isActive: true,
      createdDate: new Date().toISOString().split('T')[0],
    };
    handleLogin(guestUser);
  };

  // Failed login attempt handler for Audit Log
  const handleFailedLogin = (attemptedUserId: string, reason: string) => {
    const matched = users.find((u) => u.userId.toLowerCase() === attemptedUserId.toLowerCase());
    const failedEntry = createAuditLogEntry({
      userId: attemptedUserId || 'anonymous',
      userName: matched ? matched.name : 'Unknown User',
      userRole: matched ? matched.role : 'public_viewer',
      action: 'UNAUTHORIZED_ATTEMPT',
      details: `${reason} for user ID "${attemptedUserId}".`,
      entityType: 'AUTH',
    });
    setAuditLogs((prev) => {
      const updated = [failedEntry, ...prev];
      saveAuditLogs(updated);
      return updated;
    });
  };

  // Sign out handler
  const handleSignOut = () => {
    logEvent('LOGOUT', `${currentUser.name} (${currentUser.userId}) signed out of the session.`, 'AUTH');
    setIsAuthenticated(false);
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    showToast('Logged out. Returned to Login Interface.');
  };

  // Update password for CURRENT logged-in user
  const handleUpdateOwnPassword = (newPassword: string) => {
    const updatedUser = { ...currentUser, password: newPassword };
    const updatedList = users.map((u) => (u.id === currentUser.id ? updatedUser : u));
    setUsers(updatedList);
    saveUserLibrary(updatedList);
    setCurrentUser(updatedUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));

    logEvent(
      'PASSWORD_CHANGE',
      `User ${currentUser.name} (${currentUser.userId}) updated their own personal account password.`,
      'USER_ACCOUNT',
      currentUser.id
    );
    showToast('Your password has been updated successfully!');
  };

  // Save changes to current dataset and localStorage
  const saveNodeChanges = useCallback((updatedNodes: OrgNodeData[], actionDesc?: string) => {
    setNodes(updatedNodes);
    setAllDatasets((prev) => {
      const next = prev.map((d) => {
        if (d.id === currentDatasetId) {
          return { ...d, nodes: updatedNodes };
        }
        return d;
      });
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // quota ignore
      }
      return next;
    });

    if (actionDesc) {
      showToast(actionDesc, 'success');
    }
  }, [currentDatasetId]);

  // Save User Library changes (ADMIN ONLY)
  const handleSaveUsers = (updatedUsers: UserAccount[]) => {
    if (!isAdmin) {
      logEvent('UNAUTHORIZED_ATTEMPT', `Blocked unauthorized attempt to edit User Password Library.`, 'USER_ACCOUNT');
      showToast('Only administrators can edit the User Password Library.', 'error');
      return;
    }

    setUsers(updatedUsers);
    saveUserLibrary(updatedUsers);

    // Update current user if edited
    const matched = updatedUsers.find((u) => u.id === currentUser.id);
    if (matched) {
      setCurrentUser(matched);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(matched));
    }

    logEvent('USER_MANAGEMENT', `Administrator updated User ID & Password Library records.`, 'USER_ACCOUNT');
    showToast('User ID & Password Library updated successfully.');
  };

  // Clear Audit Logs (ADMIN ONLY)
  const handleClearAuditLogs = () => {
    if (!isAdmin) return;
    setAuditLogs([]);
    saveAuditLogs([]);
    showToast('Audit log history cleared.');
  };

  // Hierarchy Tree structure
  const roots: HierarchyNode[] = useMemo(() => {
    return buildHierarchyTree(nodes, collapsedIds);
  }, [nodes, collapsedIds]);

  // Collapse / Expand handlers
  const handleToggleCollapse = (nodeId: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const handleCollapseAll = () => {
    const next = new Set<string>();
    nodes.forEach((n) => {
      if (n.levelNumber >= 2) next.add(n.id);
    });
    setCollapsedIds(next);
  };

  const handleExpandAll = () => {
    setCollapsedIds(new Set());
  };

  // Select node with VIEW audit logging
  const handleSelectNode = (node: HierarchyNode | OrgNodeData) => {
    setSelectedNode(node);
    logEvent(
      'VIEW',
      `Viewed details for role "${node.title}" in ${node.department} wing.`,
      'NODE',
      node.id
    );
  };

  // Reassign parent in real-time (drag & drop or modal)
  const handleReassignParent = (nodeId: string, newParentId: string) => {
    if (!isManagerOrAdmin) {
      logEvent(
        'UNAUTHORIZED_ATTEMPT',
        `Blocked drag-and-drop hierarchy reassignment attempt on node "${nodeId}" without manager/admin permissions.`,
        'NODE',
        nodeId
      );
      showToast('Admin or Manager privileges required to modify reporting structure.', 'error');
      return;
    }

    if (nodeId === newParentId) return;

    if (willCreateCycle(nodes, nodeId, newParentId)) {
      showToast('Cannot reassign: Circular reporting loop detected.', 'error');
      return;
    }

    const dragged = nodes.find((n) => n.id === nodeId);
    const target = nodes.find((n) => n.id === newParentId);

    const updated = nodes.map((n) => {
      if (n.id === nodeId) {
        return {
          ...n,
          reportsTo: newParentId,
          department: target ? target.department : n.department,
          levelNumber: target ? target.levelNumber + 1 : n.levelNumber,
        };
      }
      return n;
    });

    const desc = `Reassigned "${dragged?.title || 'Role'}" to report under "${target?.title || 'Manager'}"`;
    logEvent('EDIT', desc, 'NODE', nodeId);
    saveNodeChanges(updated, desc);
  };

  // Admin/Manager: Open Add Subordinate
  const handleOpenAddChild = (parent: OrgNodeData) => {
    if (!isManagerOrAdmin) {
      logEvent('UNAUTHORIZED_ATTEMPT', `Blocked attempt to add subordinate under "${parent.title}".`, 'NODE', parent.id);
      showToast('Manager or Admin permissions required to add subordinates.', 'error');
      return;
    }
    setAdminParentNode(parent);
    setAdminEditNode(null);
    setAdminModalMode('add');
    setIsAdminModalOpen(true);
  };

  // Admin/Manager: Open Edit Node
  const handleOpenEdit = (node: OrgNodeData) => {
    if (!isManagerOrAdmin) {
      logEvent('UNAUTHORIZED_ATTEMPT', `Blocked attempt to edit role "${node.title}".`, 'NODE', node.id);
      showToast('Manager or Admin permissions required to edit roles.', 'error');
      return;
    }
    setAdminEditNode(node);
    setAdminParentNode(null);
    setAdminModalMode('edit');
    setIsAdminModalOpen(true);
  };

  // Admin/Manager: Save from modal
  const handleSaveModal = (savedNode: OrgNodeData) => {
    let updated: OrgNodeData[];
    if (adminModalMode === 'add') {
      updated = [...nodes, savedNode];
      const desc = `Created new role "${savedNode.title}" under ${savedNode.department} (Band: ${savedNode.band})`;
      logEvent('CREATE', desc, 'NODE', savedNode.id);
      showToast(desc);
    } else {
      updated = nodes.map((n) => (n.id === savedNode.id ? savedNode : n));
      const desc = `Updated role details for "${savedNode.title}" in ${savedNode.department}`;
      logEvent('EDIT', desc, 'NODE', savedNode.id);
      showToast(desc);
      if (selectedNode?.id === savedNode.id) {
        setSelectedNode(savedNode);
      }
    }
    saveNodeChanges(updated);
    setIsAdminModalOpen(false);
  };

  // Admin/Manager: Delete node
  const handleDeleteNode = (nodeId: string) => {
    if (!isManagerOrAdmin) {
      logEvent('UNAUTHORIZED_ATTEMPT', `Blocked unauthorized deletion attempt on node "${nodeId}".`, 'NODE', nodeId);
      showToast('Admin permissions required to delete roles.', 'error');
      return;
    }

    const target = nodes.find((n) => n.id === nodeId);
    if (!target) return;

    if (!target.reportsTo) {
      showToast('Cannot delete the top root organization node.', 'error');
      return;
    }

    const updated = nodes
      .filter((n) => n.id !== nodeId)
      .map((n) => {
        if (n.reportsTo === nodeId) {
          return { ...n, reportsTo: target.reportsTo };
        }
        return n;
      });

    const desc = `Deleted role "${target.title}" in ${target.department}. Subordinates reassigned to parent manager.`;
    logEvent('DELETE', desc, 'NODE', nodeId);
    saveNodeChanges(updated, desc);
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  };

  // Reset to authentic default
  const handleResetOrg = () => {
    if (!isAdmin) return;
    const original = INITIAL_PRESETS.find((d) => d.id === currentDatasetId) || AFWL_MASTER_DATASET;
    logEvent('EDIT', `Reset organization structure "${original.name}" to authentic PDF defaults.`, 'DATASET', original.id);
    saveNodeChanges(original.nodes, `Reset ${original.name} to authentic PDF structure`);
  };

  // Apply parsed uploaded or Google Drive dataset
  const handleApplyDataset = (newDataset: OrgDataset) => {
    setAllDatasets((prev) => {
      const exists = prev.some((d) => d.id === newDataset.id);
      const next = exists
        ? prev.map((d) => (d.id === newDataset.id ? newDataset : d))
        : [newDataset, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    setCurrentDatasetId(newDataset.id);
    localStorage.setItem(ACTIVE_DS_KEY, newDataset.id);
    setNodes(newDataset.nodes);
    logEvent('CREATE', `Imported structure dataset "${newDataset.name}" with ${newDataset.nodes.length} roles.`, 'DATASET', newDataset.id);
    showToast(`Loaded "${newDataset.name}" with ${newDataset.nodes.length} roles.`);
  };

  // -------------------------------------------------------------
  // JOB DESCRIPTION (JD) MANAGEMENT HANDLERS (ADMIN ONLY MUTATIONS)
  // -------------------------------------------------------------
  const handleSaveJD = (jd: JobDescription, isNew: boolean) => {
    if (!isAdmin) {
      showToast('Permission Denied: Only Administrator can upload or modify Job Descriptions.', 'error');
      logEvent('UNAUTHORIZED_ATTEMPT', `Attempted unauthorized ${isNew ? 'creation' : 'modification'} of JD ${jd.code}`);
      return;
    }

    setJds((prev) => {
      let updated: JobDescription[];
      if (isNew) {
        updated = [jd, ...prev];
      } else {
        updated = prev.map((j) => (j.id === jd.id ? jd : j));
      }
      saveJDs(updated);
      return updated;
    });

    logEvent(
      isNew ? 'JD_UPLOAD' : 'JD_UPDATE',
      `${isNew ? 'Uploaded and deployed' : 'Updated revision of'} Job Description: ${jd.code} (${jd.title}) with scope ${jd.scopeType}`,
      'JOB_DESCRIPTION',
      jd.id
    );

    showToast(
      isNew ? `Job Description ${jd.code} uploaded and distributed.` : `Job Description ${jd.code} updated.`,
      'success'
    );
  };

  const handleDeleteJD = (jdId: string) => {
    if (!isAdmin) {
      showToast('Permission Denied: Only Administrator can delete Job Descriptions.', 'error');
      return;
    }

    const target = jds.find((j) => j.id === jdId);
    if (!target) return;

    if (!confirm(`Are you sure you want to delete Job Description "${target.title}" (${target.code})?`)) {
      return;
    }

    setJds((prev) => {
      const updated = prev.filter((j) => j.id !== jdId);
      saveJDs(updated);
      return updated;
    });

    logEvent('JD_DELETE', `Deleted Job Description: ${target.code} (${target.title})`, 'JOB_DESCRIPTION', target.id);
    showToast(`Deleted Job Description ${target.code}.`, 'success');
  };

  const handleOpenJDPdfFromDrawer = (
    jd: JobDescription,
    res: JDResolutionResult,
    node: OrgNodeData
  ) => {
    setSelectedJDForPdf(jd);
    setSelectedJDPriorityInfo({
      level: res.priorityLevel,
      label: res.priorityLabel,
      ruleDescription: res.ruleDescription,
      isConflict: res.isConflict,
    });
    setSelectedJDEmployeeContext({
      id: node.id,
      name: node.name,
      title: node.title,
      department: node.department,
      brand: node.brand,
      reportingManagerName: node.reportsTo ? nodes.find((n) => n.id === node.reportsTo)?.name : undefined,
    });
    setIsJDPdfModalOpen(true);
    logEvent('VIEW', `Inspected assigned JD PDF (${jd.code}) for employee ${node.id} (${node.name || node.title})`, 'JOB_DESCRIPTION', jd.id);
  };

  const handleAssignJDForNode = (node: OrgNodeData) => {
    if (!isAdmin) {
      showToast('Permission Denied: Only Administrator can assign Job Descriptions.', 'error');
      return;
    }
    setEditingJD(null);
    setIsJDUploadModalOpen(true);
  };

  // Unauthorized count for warning dot in header
  const unauthorizedCount = useMemo(() => {
    return auditLogs.filter((l) => l.action === 'UNAUTHORIZED_ATTEMPT').length;
  }, [auditLogs]);

  // IF NOT AUTHENTICATED: RENDER LOGIN INTERFACE FIRST
  if (!isAuthenticated) {
    return (
      <LoginPage
        users={users}
        onLogin={handleLogin}
        onGuestAccess={handleGuestAccess}
        onFailedLogin={handleFailedLogin}
      />
    );
  }

  // AUTHENTICATED WORKSPACE WITH ASSIGNED INTERFACE PREVIEW
  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Top Bar Header with Turag Logo, Audit Logs, and User Actions */}
      <Header
        currentDataset={currentDataset}
        allDatasets={allDatasets}
        onSelectDataset={(id) => {
          setCurrentDatasetId(id);
          localStorage.setItem(ACTIVE_DS_KEY, id);
          logEvent('VIEW', `Switched active organization dataset to "${id}".`, 'DATASET', id);
        }}
        activeView={activeView}
        onChangeView={(v) => {
          setActiveView(v);
          logEvent('VIEW', `Switched view mode to "${v.toUpperCase()}".`);
        }}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onSignOut={handleSignOut}
        onOpenUserLibrary={() => {
          logEvent('VIEW', `Administrator accessed User ID & Password Library.`, 'USER_ACCOUNT');
          setIsUserLibModalOpen(true);
        }}
        onOpenAuditLogs={() => {
          logEvent('VIEW', `Administrator inspected Security & Activity Audit Log.`, 'AUTH');
          setIsAuditLogModalOpen(true);
        }}
        onOpenChangePassword={() => setIsChangePasswordModalOpen(true)}
        onOpenGoogleDrive={() => {
          logEvent('VIEW', `Opened Google Drive Data File integration loader.`, 'DATASET');
          setIsGoogleDriveModalOpen(true);
        }}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onOpenPdfViewer={() => {
          logEvent('VIEW', `Viewed source PDF diagram attachments.`, 'DATASET');
          setIsPdfModalOpen(true);
        }}
        onExportCsv={() => {
          logEvent('VIEW', `Exported organogram CSV roster.`, 'DATASET');
          exportToCSV(nodes, currentDataset.name);
        }}
        onResetOrg={handleResetOrg}
        unauthorizedAttemptsCount={unauthorizedCount}
        totalLogsCount={auditLogs.length}
        currentTheme={theme}
        onSelectTheme={setTheme}
      />

      {/* Main View Area (Adjusted for high-density header) */}
      <main className="flex-1 w-full h-[calc(100vh-58px)] overflow-hidden relative">
        {/* Manpower Summary View (Visible to BOTH Admin and Public Previewers) */}
        {activeView === 'manpower' && (
          <ManpowerSummaryView
            nodes={nodes}
            onSelectDepartmentInTree={(deptName) => {
              setSelectedDepartmentFilter(deptName);
              const target = nodes.find((n) => n.department === deptName);
              if (target) handleSelectNode(target);
              setActiveView('tree');
            }}
            isAdmin={isAdmin}
          />
        )}

        {/* Centralized JD Management Dashboard (STRICTLY ADMIN ONLY) */}
        {activeView === 'jd_management' && isAdmin && (
          <JDManagementDashboard
            jds={jds}
            allNodes={nodes}
            userRole={currentUser.role}
            onOpenUploadNew={() => {
              if (!isAdmin) {
                showToast('Permission Denied: Only Administrator can upload Job Descriptions.', 'error');
                return;
              }
              setEditingJD(null);
              setIsJDUploadModalOpen(true);
            }}
            onViewJDPdf={(jd) => {
              setSelectedJDForPdf(jd);
              setSelectedJDPriorityInfo(undefined);
              setSelectedJDEmployeeContext(undefined);
              setIsJDPdfModalOpen(true);
              logEvent('VIEW', `Opened PDF Job Description: ${jd.code} (${jd.title})`, 'JOB_DESCRIPTION', jd.id);
            }}
            onEditJD={(jd) => {
              if (!isAdmin) {
                showToast('Permission Denied: Only Administrator can modify Job Descriptions.', 'error');
                return;
              }
              setEditingJD(jd);
              setIsJDUploadModalOpen(true);
            }}
            onDeleteJD={handleDeleteJD}
            onSelectEmployeeInTree={(node) => {
              handleSelectNode(node);
              setActiveView('tree');
            }}
          />
        )}

        {/* Interactive Organogram Tree View with Department-wise Filter */}
        {activeView === 'tree' && (
          <OrgCanvas
            roots={roots}
            allNodes={nodes}
            selectedDepartment={selectedDepartmentFilter}
            onSelectDepartment={setSelectedDepartmentFilter}
            userRole={currentUser.role}
            collapsedIds={collapsedIds}
            onToggleCollapse={handleToggleCollapse}
            onCollapseAll={handleCollapseAll}
            onExpandAll={handleExpandAll}
            onEditNode={handleOpenEdit}
            onAddChild={handleOpenAddChild}
            onDeleteNode={handleDeleteNode}
            onSelectNode={handleSelectNode}
            onReassignParent={handleReassignParent}
          />
        )}

        {/* Department Overview Grid */}
        {activeView === 'departments' && (
          <DepartmentGridView
            nodes={nodes}
            onSelectDepartmentNode={(node) => {
              setSelectedDepartmentFilter(node.department);
              handleSelectNode(node);
              setActiveView('tree');
            }}
          />
        )}

        {/* Roster Table */}
        {activeView === 'table' && (
          <RosterTableView
            nodes={nodes}
            userRole={currentUser.role}
            onEditNode={handleOpenEdit}
            onAddChild={handleOpenAddChild}
            onDeleteNode={handleDeleteNode}
            onSelectNode={handleSelectNode}
            onFocusInTree={(node) => {
              handleSelectNode(node);
              setActiveView('tree');
            }}
          />
        )}
      </main>

      {/* Compact Corner Manager & Role Quick Panel (Fixed bottom-right corner) */}
      <div className="fixed bottom-4 right-4 z-30 transition-all select-none">
        {!isManagerPanelExpanded ? (
          <div className="flex items-center gap-1.5 p-1.5 pl-3 bg-slate-900/90 hover:bg-slate-900 text-white rounded-full shadow-lg border border-slate-700/80 backdrop-blur-sm text-xs font-semibold">
            {isAdmin ? (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Panel</span>
              </span>
            ) : isManager ? (
              <span className="flex items-center gap-1.5 text-amber-400">
                <Shield className="w-4 h-4" />
                <span>Manager: {currentUser.department}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-slate-300">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>Public View</span>
              </span>
            )}
            <span className="text-slate-500">|</span>
            <span className="text-slate-300 font-normal truncate max-w-[120px]">{currentUser.name}</span>
            <button
              type="button"
              onClick={() => setIsManagerPanelExpanded(true)}
              className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 ml-1 transition-colors"
              title="Expand Quick Control Panel"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="w-72 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 p-3.5 animate-in slide-in-from-bottom-2 duration-150 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2.5">
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ) : isManager ? (
                  <Shield className="w-4 h-4 text-amber-400" />
                ) : (
                  <Eye className="w-4 h-4 text-emerald-400" />
                )}
                <div>
                  <div className="font-bold uppercase tracking-wider text-[10px] text-slate-400">
                    {isAdmin ? 'Admin Workspace' : isManager ? 'Manager Workspace' : 'Preview Mode'}
                  </div>
                  <div className="font-semibold text-slate-100 truncate max-w-[160px]">
                    {currentUser.name}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManagerPanelExpanded(false)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Context tags */}
            {currentUser.department && currentUser.department !== 'All Departments' && (
              <div className="text-[10px] bg-slate-800/80 px-2 py-1 rounded text-amber-300 mb-2 border border-slate-700/60 font-mono">
                Scope: {currentUser.department} Department
              </div>
            )}

            {/* Quick Actions List */}
            <div className="space-y-1 mb-3">
              {isAdmin && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserLibModalOpen(true);
                      setIsManagerPanelExpanded(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-800 text-slate-200 flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Key className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Password Library</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{users.length} Users</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAuditLogModalOpen(true);
                      setIsManagerPanelExpanded(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-800 text-slate-200 flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                      <span>Audit Logs</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{auditLogs.length}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUploadModalOpen(true);
                      setIsManagerPanelExpanded(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-800 text-slate-200 flex items-center gap-2 transition-colors"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-slate-300" />
                    <span>Upload PDF / Visio</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsGoogleDriveModalOpen(true);
                      setIsManagerPanelExpanded(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-800 text-slate-200 flex items-center gap-2 transition-colors"
                  >
                    <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Google Drive Sync</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingJD(null);
                      setIsJDUploadModalOpen(true);
                      setIsManagerPanelExpanded(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-800 text-slate-200 flex items-center gap-2 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-red-400" />
                    <span>Upload & Assign New JD</span>
                  </button>
                </>
              )}

              {isManager && currentUser.department && (
                <button
                  type="button"
                  onClick={() => {
                    const target = nodes.find((n) => n.department.toLowerCase() === currentUser.department?.toLowerCase());
                    if (target) {
                      handleSelectNode(target);
                      setActiveView('tree');
                    }
                    setIsManagerPanelExpanded(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 flex items-center gap-2 transition-colors"
                >
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                  <span>Focus {currentUser.department} in Tree</span>
                </button>
              )}
            </div>

            {/* Sign Out Button */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setIsChangePasswordModalOpen(true);
                  setIsManagerPanelExpanded(false);
                }}
                className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
              >
                Change Password
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-red-900/60 text-slate-300 hover:text-white text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3 h-3 text-red-400" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Node Detail Drawer with JD Integration */}
      <NodeDetailDrawer
        node={selectedNode}
        allNodes={nodes}
        allJDs={jds}
        userRole={currentUser.role}
        onClose={() => setSelectedNode(null)}
        onEdit={handleOpenEdit}
        onAddChild={handleOpenAddChild}
        onDelete={handleDeleteNode}
        onSelectAnotherNode={handleSelectNode}
        onOpenJDPdf={handleOpenJDPdfFromDrawer}
        onAssignJD={handleAssignJDForNode}
      />

      {/* Admin/Manager Panel Modal for Add / Edit */}
      <AdminPanelModal
        isOpen={isAdminModalOpen}
        mode={adminModalMode}
        initialNode={adminEditNode}
        parentNode={adminParentNode}
        allNodes={nodes}
        onSave={handleSaveModal}
        onClose={() => setIsAdminModalOpen(false)}
      />

      {/* File Upload Modal (PDF, Visio, CSV) (ADMIN ONLY) */}
      {isAdmin && (
        <FileUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onApplyDataset={handleApplyDataset}
        />
      )}

      {/* Google Drive Integration Modal (ADMIN ONLY) */}
      {isAdmin && (
        <GoogleDriveLoaderModal
          isOpen={isGoogleDriveModalOpen}
          onClose={() => setIsGoogleDriveModalOpen(false)}
          onApplyDataset={handleApplyDataset}
          currentDataset={currentDataset}
        />
      )}

      {/* User ID & Password Library Modal (ADMIN ONLY) */}
      <UserLibraryModal
        isOpen={isUserLibModalOpen}
        onClose={() => setIsUserLibModalOpen(false)}
        users={users}
        onSaveUsers={handleSaveUsers}
        currentUser={currentUser}
      />

      {/* Change Password Modal (For ALL Users to update their own password) */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        currentUser={currentUser}
        onUpdatePassword={handleUpdateOwnPassword}
      />

      {/* Security & Activity Audit Log Modal (ADMIN ONLY) */}
      <AuditLogModal
        isOpen={isAuditLogModalOpen}
        onClose={() => setIsAuditLogModalOpen(false)}
        logs={auditLogs}
        onClearLogs={handleClearAuditLogs}
        isAdmin={isAdmin}
      />

      {/* Switch Account Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLogin}
        users={users}
        currentUser={currentUser}
        onFailedLogin={handleFailedLogin}
      />

      {/* PDF Reference Viewer Modal (ADMIN ONLY) */}
      {isAdmin && (
        <PdfViewerModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          defaultPdf={currentDataset.pdfPath}
        />
      )}

      {/* Job Description (JD) Formal PDF Viewer Modal */}
      <JDPdfViewerModal
        isOpen={isJDPdfModalOpen}
        jd={selectedJDForPdf}
        employeeContext={selectedJDEmployeeContext}
        priorityInfo={selectedJDPriorityInfo}
        userRole={currentUser.role}
        onClose={() => {
          setIsJDPdfModalOpen(false);
          setSelectedJDForPdf(null);
          setSelectedJDPriorityInfo(undefined);
          setSelectedJDEmployeeContext(undefined);
        }}
        onEditJD={(targetJD) => {
          if (!isAdmin) {
            showToast('Permission Denied: Only Admin can edit Job Descriptions.', 'error');
            return;
          }
          setIsJDPdfModalOpen(false);
          setEditingJD(targetJD);
          setIsJDUploadModalOpen(true);
        }}
      />

      {/* Upload & Assign Job Description Modal (ADMIN ONLY) */}
      {isAdmin && (
        <JDUploadAssignModal
          isOpen={isJDUploadModalOpen}
          onClose={() => {
            setIsJDUploadModalOpen(false);
            setEditingJD(null);
          }}
          onSaveJD={handleSaveJD}
          existingJD={editingJD}
          allNodes={nodes}
          currentUser={currentUser}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white text-xs font-medium rounded-xl shadow-lg border border-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-150">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}
