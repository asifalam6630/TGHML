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
  AuditActionType
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
  LogOut
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
      entityType?: 'AUTH' | 'NODE' | 'MANPOWER' | 'USER_ACCOUNT' | 'DATASET',
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

  // Active view: tree | departments | table | manpower
  const [activeView, setActiveView] = useState<'tree' | 'departments' | 'table' | 'manpower'>('tree');

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
      />

      {/* Role-Specific Contextual Control Strip */}
      <div className={`px-6 py-2 border-b flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 ${
        isAdmin 
          ? 'bg-slate-900 text-white border-slate-800'
          : isManager
          ? 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
          : 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
      }`}>
        {/* Left: Role identity and assigned department */}
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>ADMIN CONTROL PANEL</span>
            </div>
          ) : isManager ? (
            <div className="flex items-center gap-1.5 font-bold">
              <Shield className="w-4 h-4 text-amber-600" />
              <span>MANAGER WORKSPACE</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 font-bold">
              <Eye className="w-4 h-4 text-emerald-600" />
              <span>PUBLIC PREVIEW MODE</span>
            </div>
          )}
          <span className="opacity-40">|</span>
          <span className="font-medium">
            User: <strong>{currentUser.name}</strong> ({currentUser.userId})
          </span>
          {currentUser.department && currentUser.department !== 'All Departments' && (
            <span className="opacity-90">
              · Scope: <strong>{currentUser.department} Department</strong>
            </span>
          )}
        </div>

        {/* Right: Quick Action Shortcuts based on assigned interface */}
        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={() => setIsAuditLogModalOpen(true)}
                className="px-2.5 py-1 rounded bg-red-900/80 hover:bg-red-800 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
                title="Security & Activity Audit Log"
              >
                <ShieldAlert className="w-3 h-3 text-red-300" />
                <span>Audit Logs ({auditLogs.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setIsUserLibModalOpen(true)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
              >
                <Key className="w-3 h-3 text-indigo-400" />
                <span>Password Library</span>
              </button>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
              >
                <UploadCloud className="w-3 h-3 text-slate-300" />
                <span>Upload PDF/Visio</span>
              </button>
              <button
                type="button"
                onClick={() => setIsGoogleDriveModalOpen(true)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
              >
                <HardDrive className="w-3 h-3 text-emerald-400" />
                <span>Google Drive Sync</span>
              </button>
            </>
          )}

          {isManager && currentUser.department && (
            <button
              type="button"
              onClick={() => {
                const target = nodes.find((n) => n.department.toLowerCase() === currentUser.department?.toLowerCase());
                if (target) {
                  setSelectedNode(target);
                  setActiveView('tree');
                }
              }}
              className="px-2.5 py-1 rounded bg-amber-600 text-white hover:bg-amber-700 text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-2xs"
            >
              <Target className="w-3 h-3" />
              <span>Focus {currentUser.department} in Tree</span>
            </button>
          )}

          {!isAdmin && !isManager && (
            <span className="text-[11px] opacity-80 flex items-center gap-1">
              <span>Read-only hierarchy explorer. To edit, please login as Admin or Manager.</span>
            </span>
          )}

          {/* Logout Action in Strip */}
          <button
            type="button"
            onClick={handleSignOut}
            className="px-2 py-0.5 rounded border border-inherit hover:bg-black/10 transition-colors text-[11px] font-semibold flex items-center gap-1 ml-1"
            title="Logout to Login Interface"
          >
            <LogOut className="w-3 h-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <main className="flex-1 w-full h-[calc(100vh-104px)] overflow-hidden relative">
        {/* Manpower Summary View (Visible to BOTH Admin and Public Previewers) */}
        {activeView === 'manpower' && (
          <ManpowerSummaryView
            nodes={nodes}
            onSelectDepartmentInTree={(deptName) => {
              const target = nodes.find((n) => n.department === deptName);
              if (target) handleSelectNode(target);
              setActiveView('tree');
            }}
            isAdmin={isAdmin}
          />
        )}

        {/* Interactive Organogram Tree View */}
        {activeView === 'tree' && (
          <OrgCanvas
            roots={roots}
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

      {/* Node Detail Drawer */}
      <NodeDetailDrawer
        node={selectedNode}
        allNodes={nodes}
        userRole={currentUser.role}
        onClose={() => setSelectedNode(null)}
        onEdit={handleOpenEdit}
        onAddChild={handleOpenAddChild}
        onDelete={handleDeleteNode}
        onSelectAnotherNode={handleSelectNode}
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
      />

      {/* PDF Reference Viewer Modal (ADMIN ONLY) */}
      {isAdmin && (
        <PdfViewerModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          defaultPdf={currentDataset.pdfPath}
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
