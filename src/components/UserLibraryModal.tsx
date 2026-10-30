/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserAccount, UserRole } from '../types/organogram';
import { 
  X, 
  UserPlus, 
  Key, 
  Trash2, 
  Edit2, 
  Check, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Shield, 
  Users, 
  RotateCcw,
  Search,
  Copy
} from 'lucide-react';
import { INITIAL_USER_LIBRARY } from '../data/userLibrary';

interface UserLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserAccount[];
  onSaveUsers: (users: UserAccount[]) => void;
  currentUser: UserAccount;
}

export const UserLibraryModal: React.FC<UserLibraryModalProps> = ({
  isOpen,
  onClose,
  users,
  onSaveUsers,
  currentUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form state
  const [formUserId, setFormUserId] = useState('');
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('manager');
  const [formPassword, setFormPassword] = useState('');
  const [formDepartment, setFormDepartment] = useState('Sewing');
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.userId.toLowerCase().includes(q) ||
      u.name.toLowerCase().includes(q) ||
      (u.department && u.department.toLowerCase().includes(q)) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStartAdd = () => {
    setFormUserId('');
    setFormName('');
    setFormRole('manager');
    setFormPassword('');
    setFormDepartment('Sewing');
    setErrorMessage('');
    setIsAddingUser(true);
    setEditingUserId(null);
  };

  const handleStartEdit = (user: UserAccount) => {
    setFormUserId(user.userId);
    setFormName(user.name);
    setFormRole(user.role);
    setFormPassword(user.password);
    setFormDepartment(user.department || 'All');
    setErrorMessage('');
    setEditingUserId(user.id);
    setIsAddingUser(false);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUserId.trim() || !formPassword.trim() || !formName.trim()) {
      setErrorMessage('User ID, Name, and Password are required.');
      return;
    }

    // Check duplicate userId
    const isDuplicate = users.some(
      (u) => u.userId.toLowerCase() === formUserId.trim().toLowerCase() && u.id !== editingUserId
    );
    if (isDuplicate) {
      setErrorMessage(`User ID "${formUserId}" already exists.`);
      return;
    }

    if (editingUserId) {
      // Edit
      const updated = users.map((u) => {
        if (u.id === editingUserId) {
          return {
            ...u,
            userId: formUserId.trim(),
            name: formName.trim(),
            role: formRole,
            password: formPassword.trim(),
            department: formDepartment,
          };
        }
        return u;
      });
      onSaveUsers(updated);
      setEditingUserId(null);
    } else {
      // Add
      const newUser: UserAccount = {
        id: `usr-${Date.now()}`,
        userId: formUserId.trim(),
        name: formName.trim(),
        role: formRole,
        password: formPassword.trim(),
        department: formDepartment,
        isActive: true,
        createdDate: new Date().toISOString().split('T')[0],
      };
      onSaveUsers([...users, newUser]);
      setIsAddingUser(false);
    }
  };

  const handleDeleteUser = (id: string) => {
    if (users.length <= 1) {
      alert('Cannot delete the last remaining user account.');
      return;
    }
    const updated = users.filter((u) => u.id !== id);
    onSaveUsers(updated);
  };

  const handleToggleStatus = (id: string) => {
    const updated = users.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u));
    onSaveUsers(updated);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset User & Password Library to default seed accounts?')) {
      onSaveUsers(INITIAL_USER_LIBRARY);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden my-8 max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>User ID & Password Library</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Admin Control Panel
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage login credentials, role access (Admin, Manager, Public Viewer), and department assignments.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleStartAdd}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add New User</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form if Adding / Editing */}
        {(isAddingUser || editingUserId) && (
          <form
            onSubmit={handleSaveForm}
            className="p-5 border-b border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 space-y-3 shrink-0"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-600" />
                <span>{editingUserId ? 'Edit User Credentials' : 'Create New User Account'}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsAddingUser(false);
                  setEditingUserId(null);
                }}
                className="text-xs text-slate-500 hover:underline"
              >
                Cancel
              </button>
            </div>

            {errorMessage && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  User ID / Username *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. mgr_finishing"
                  value={formUserId}
                  onChange={(e) => setFormUserId(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Md. Belal Hossain"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. turag2026"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Role
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                  className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                >
                  <option value="admin">Admin (Full Control)</option>
                  <option value="manager">Manager (Reporting Edits)</option>
                  <option value="public_viewer">Public Viewer (Read-only)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sewing"
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
              >
                {editingUserId ? 'Save Credential Changes' : 'Add User to Library'}
              </button>
            </div>
          </form>
        )}

        {/* Search & Actions Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search user ID, name, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 text-xs bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              Total Accounts: <strong>{users.length}</strong>
            </span>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs"
              title="Reset to default factory user library"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* User Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/60 sticky top-0 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4">User ID</th>
                <th className="py-2.5 px-4">Full Name</th>
                <th className="py-2.5 px-4">Role Access</th>
                <th className="py-2.5 px-4">Password</th>
                <th className="py-2.5 px-4">Department</th>
                <th className="py-2.5 px-4 text-center">Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredUsers.map((u) => {
                const isPasswordRevealed = !!showPasswords[u.id];

                return (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* User ID */}
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                      {u.userId}
                    </td>

                    {/* Name */}
                    <td className="py-2.5 px-4 text-slate-800 dark:text-slate-200 font-medium">
                      {u.name}
                    </td>

                    {/* Role */}
                    <td className="py-2.5 px-4">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Admin</span>
                        </span>
                      ) : u.role === 'manager' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          <Shield className="w-3 h-3" />
                          <span>Manager</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          <Users className="w-3 h-3" />
                          <span>Public Viewer</span>
                        </span>
                      )}
                    </td>

                    {/* Password */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-800 dark:text-slate-200">
                          {isPasswordRevealed ? u.password : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(u.id)}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded"
                          title={isPasswordRevealed ? 'Mask password' : 'Show password'}
                        >
                          {isPasswordRevealed ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(u.password, u.id)}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded"
                          title="Copy password"
                        >
                          {copiedId === u.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                      {u.department || 'All'}
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(u.id)}
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold cursor-pointer ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Suspended'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(u)}
                          className="p-1.5 text-slate-500 hover:text-sky-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Edit credentials"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-950/50"
                          title="Delete user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
