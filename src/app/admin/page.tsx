"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  User,
  FolderKanban,
  Briefcase,
  Wrench,
  GraduationCap,
  FileText,
  Mail,
  Settings,
  Plus,
  Trash2,
  Upload,
  Save,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Check,
  Lock,
  LogOut,
  Sun,
  Moon,
  Download,
  RotateCcw,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme-provider";
import { usePortfolio } from "@/components/portfolio-provider";
import type { PortfolioData } from "@/lib/portfolio-types";
import { cn } from "@/lib/utils";

type AdminTab =
  | "overview"
  | "about"
  | "projects"
  | "experience"
  | "skills"
  | "academic"
  | "media"
  | "inbox"
  | "settings";

const SESSION_AUTH_KEY = "portfolio_admin_password_session";

export default function AdminPortalPage() {
  const { theme, toggle } = useTheme();
  const { data: liveData, refresh, setLocalData } = usePortfolio();

  const [password, setPassword] = useState<string>("");
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  const [draft, setDraft] = useState<PortfolioData>(liveData);
  const [hasUnsaved, setHasUnsaved] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Skill item input states per category index
  const [newSkillInputs, setNewSkillInputs] = useState<Record<number, string>>(
    {}
  );

  // Password change states
  const [newAdminPass, setNewAdminPass] = useState<string>("");

  useEffect(() => {
    setDraft(liveData);
  }, [liveData]);

  useEffect(() => {
    const savedPass = sessionStorage.getItem(SESSION_AUTH_KEY);
    if (savedPass) {
      setPassword(savedPass);
      setAuthenticated(true);
    }
  }, []);

  const showNotice = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  const updateDraft = (updater: (prev: PortfolioData) => PortfolioData) => {
    setDraft((prev) => {
      const next = updater(prev);
      setHasUnsaved(true);
      return next;
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        sessionStorage.setItem(SESSION_AUTH_KEY, password);
        setAuthenticated(true);
      } else {
        setAuthError("Invalid password. Default is admin123");
      }
    } catch {
      setAuthError("Could not verify password.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_AUTH_KEY);
    setAuthenticated(false);
    setPassword("");
  };

  const savePortfolio = async (customData?: PortfolioData) => {
    const payload = customData ?? draft;
    setSaving(true);
    try {
      const res = await fetch("/api/portfolio", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save changes.");
      }

      const saved = (await res.json()) as PortfolioData;
      setDraft(saved);
      setLocalData(saved);
      setHasUnsaved(false);
      await refresh();
      showNotice("success", "All changes saved and published live!");
    } catch {
      // Fallback local persistence
      setLocalData(payload);
      setHasUnsaved(false);
      showNotice(
        "success",
        "Saved to local browser storage (serverless read-only fallback)."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (
    file: File,
    category: "profile" | "project" | "cv" | "og",
    keyId: string,
    onUrlReady: (url: string) => void
  ) => {
    setUploadingKey(keyId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "x-admin-password": password,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const result = (await res.json()) as { url: string };
      onUrlReady(result.url);
      showNotice(
        "success",
        `Uploaded "${file.name}"! Click "Save Changes" to publish.`
      );
    } catch {
      showNotice("error", "File upload failed. Please try again.");
    } finally {
      setUploadingKey(null);
    }
  };

  const handleToggleMessageRead = async (id: string, read: boolean) => {
    try {
      const res = await fetch("/api/contact", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ id, read }),
      });
      if (res.ok) {
        const { messages } = (await res.json()) as {
          messages: PortfolioData["messages"];
        };
        const updated = { ...draft, messages };
        setDraft(updated);
        setLocalData(updated);
      }
    } catch {
      showNotice("error", "Failed to update message status.");
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      const res = await fetch(`/api/contact?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          "x-admin-password": password,
        },
      });
      if (res.ok) {
        const { messages } = (await res.json()) as {
          messages: PortfolioData["messages"];
        };
        const updated = { ...draft, messages };
        setDraft(updated);
        setLocalData(updated);
        showNotice("success", "Message deleted.");
      }
    } catch {
      showNotice("error", "Could not delete message.");
    }
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `abdulfatai-portfolio-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as PortfolioData;
        setDraft(parsed);
        await savePortfolio(parsed);
        showNotice("success", "Imported portfolio backup successfully!");
      } catch {
        showNotice("error", "Invalid JSON backup file.");
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = async () => {
    if (
      !window.confirm(
        "Reset all portfolio content back to original defaults? (Your inbox messages will be kept.)"
      )
    ) {
      return;
    }
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "x-admin-password": password },
      });
      if (res.ok) {
        const resetData = (await res.json()) as PortfolioData;
        setDraft(resetData);
        setLocalData(resetData);
        setHasUnsaved(false);
        showNotice("success", "Portfolio reset to initial defaults.");
      }
    } catch {
      showNotice("error", "Failed to reset portfolio.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newAdminPass.trim().length < 4) {
      showNotice("error", "New password must be at least 4 characters.");
      return;
    }
    try {
      const res = await fetch("/api/auth", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ newPassword: newAdminPass.trim() }),
      });
      if (res.ok) {
        const updatedPass = newAdminPass.trim();
        setPassword(updatedPass);
        sessionStorage.setItem(SESSION_AUTH_KEY, updatedPass);
        setNewAdminPass("");
        showNotice("success", "Admin password updated successfully!");
      } else {
        showNotice("error", "Could not update password.");
      }
    } catch {
      showNotice("error", "Failed to update password.");
    }
  };

  const unreadCount = (draft.messages ?? []).filter((m) => !m.read).length;

  // Login Gate
  if (!authenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-8 shadow-lg">
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <Lock className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Portfolio Admin Portal
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to manage projects, upload photos &amp; CV, and edit your
              portfolio content dynamically.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="admin-password"
                className="text-sm font-medium text-foreground"
              >
                Admin Password
              </label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password (default: admin123)"
                required
              />
            </div>

            {authError && (
              <p className="text-xs font-medium text-red-500">{authError}</p>
            )}

            <Button type="submit" className="w-full">
              Unlock Admin Dashboard
            </Button>
          </form>

          <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
            <span>Default password: `admin123`</span>
            <Link
              href="/"
              className="font-medium text-primary hover:underline"
            >
              ← Back to Portfolio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tabs: {
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "about", label: "Profile & About", icon: User },
    { id: "projects", label: "Projects", icon: FolderKanban },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "skills", label: "Skills", icon: Wrench },
    { id: "academic", label: "Academic & Papers", icon: GraduationCap },
    { id: "media", label: "CV & Social Links", icon: FileText },
    {
      id: "inbox",
      label: "Messages",
      icon: Mail,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { id: "settings", label: "SEO & Backup", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Sticky Admin Bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold tracking-tight">
              Admin<span className="text-primary">.</span>
            </span>
            {hasUnsaved ? (
              <Badge className="bg-amber-500/20 text-amber-500 hover:bg-amber-500/20">
                Unsaved edits
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                Synced
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => void savePortfolio()}
              disabled={saving}
              size="sm"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>

            <Button variant="outline" size="sm" asChild>
              <Link href="/" target="_blank">
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">View Live Site</span>
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-lg border border-border bg-card px-4 py-3 shadow-lg">
          <p
            className={cn(
              "text-sm font-medium",
              toast.type === "success"
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            )}
          >
            {toast.text}
          </p>
        </div>
      )}

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-12 lg:px-8">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3">
          <nav className="flex flex-row gap-1 overflow-x-auto rounded-xl border border-border bg-card p-2 lg:flex-col">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center justify-between gap-2.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0" />
                    {tab.label}
                  </span>
                  {tab.badge !== undefined && (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-bold",
                        active
                          ? "bg-primary-foreground text-primary"
                          : "bg-primary text-primary-foreground"
                      )}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Panel */}
        <main className="space-y-8 lg:col-span-9">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">
                  Welcome back, {draft.about.name.split(" ")[0]}!
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage every section of your portfolio from one place. After
                  making edits, click &ldquo;Save Changes&rdquo; in the top bar.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-border bg-card p-5">
                  <p className="text-xs uppercase text-muted-foreground">
                    Projects
                  </p>
                  <p className="mt-1 text-3xl font-bold">
                    {draft.projects.length}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <p className="text-xs uppercase text-muted-foreground">
                    Experience Roles
                  </p>
                  <p className="mt-1 text-3xl font-bold">
                    {draft.experience.length}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <p className="text-xs uppercase text-muted-foreground">
                    Publications
                  </p>
                  <p className="mt-1 text-3xl font-bold">
                    {draft.publications.length}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <p className="text-xs uppercase text-muted-foreground">
                    Unread Messages
                  </p>
                  <p className="mt-1 text-3xl font-bold text-primary">
                    {unreadCount}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <h2 className="text-lg font-semibold">Quick Actions</h2>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("about")}
                  >
                    <Upload className="h-4 w-4" />
                    Change Profile Picture
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActiveTab("projects");
                      updateDraft((prev) => ({
                        ...prev,
                        projects: [
                          {
                            name: "New Data Analysis Project",
                            description:
                              "Describe the statistical methods, dataset, and key findings.",
                            tech: ["R", "SPSS"],
                            live: "",
                            github: "",
                            image: "/images/projects/survival-model.png",
                          },
                          ...prev.projects,
                        ],
                      }));
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Add New Project
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("media")}
                  >
                    <FileText className="h-4 w-4" />
                    Upload Real CV (PDF)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("academic")}
                  >
                    <GraduationCap className="h-4 w-4" />
                    Manage Publications &amp; Education
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("inbox")}
                  >
                    <Mail className="h-4 w-4" />
                    View Contact Inbox ({draft.messages?.length ?? 0})
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROFILE & ABOUT */}
          {activeTab === "about" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold">Profile &amp; About Me</h1>
                <p className="text-sm text-muted-foreground">
                  Update your headshot, headline, bio paragraphs, and quick
                  facts.
                </p>
              </div>

              {/* Profile Photo Card */}
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <h2 className="text-lg font-semibold">Profile Picture</h2>
                <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-2 border-primary/30 bg-muted">
                    <Image
                      src={draft.about.profileImage || "/images/profile.jpg"}
                      alt={draft.about.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-3 w-full">
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                        <Upload className="h-4 w-4" />
                        {uploadingKey === "profile"
                          ? "Uploading..."
                          : "Upload New Photo"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              void handleFileUpload(
                                f,
                                "profile",
                                "profile",
                                (url) => {
                                  updateDraft((prev) => ({
                                    ...prev,
                                    about: {
                                      ...prev.about,
                                      profileImage: url,
                                    },
                                  }));
                                }
                              );
                            }
                          }}
                        />
                      </label>
                      <span className="text-xs text-muted-foreground">
                        Recommended: Square JPG/PNG/WebP (e.g. 600×600px)
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">
                        Or paste image path / URL directly:
                      </label>
                      <Input
                        value={draft.about.profileImage}
                        onChange={(e) =>
                          updateDraft((prev) => ({
                            ...prev,
                            about: {
                              ...prev.about,
                              profileImage: e.target.value,
                            },
                          }))
                        }
                        placeholder="/images/profile.jpg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Core Identity Fields */}
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <h2 className="text-lg font-semibold">Hero &amp; Identity</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input
                      value={draft.about.name}
                      onChange={(e) =>
                        updateDraft((prev) => ({
                          ...prev,
                          about: { ...prev.about, name: e.target.value },
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Role / Title</label>
                    <Input
                      value={draft.about.role}
                      onChange={(e) =>
                        updateDraft((prev) => ({
                          ...prev,
                          about: { ...prev.about, role: e.target.value },
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-sm font-medium">Hero Tagline</label>
                    <Input
                      value={draft.about.tagline}
                      onChange={(e) =>
                        updateDraft((prev) => ({
                          ...prev,
                          about: { ...prev.about, tagline: e.target.value },
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">
                      Availability Badge
                    </label>
                    <Input
                      value={draft.about.availability}
                      onChange={(e) =>
                        updateDraft((prev) => ({
                          ...prev,
                          about: {
                            ...prev.about,
                            availability: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Location</label>
                    <Input
                      value={draft.about.location}
                      onChange={(e) =>
                        updateDraft((prev) => ({
                          ...prev,
                          about: { ...prev.about, location: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Bio Paragraphs */}
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Bio Paragraphs</h2>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateDraft((prev) => ({
                        ...prev,
                        about: {
                          ...prev.about,
                          bio: [...prev.about.bio, "New bio paragraph..."],
                        },
                      }))
                    }
                  >
                    <Plus className="h-4 w-4" />
                    Add Paragraph
                  </Button>
                </div>

                <div className="space-y-4">
                  {draft.about.bio.map((para, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Textarea
                        rows={3}
                        value={para}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft((prev) => {
                            const nextBio = [...prev.about.bio];
                            nextBio[idx] = val;
                            return {
                              ...prev,
                              about: { ...prev.about, bio: nextBio },
                            };
                          });
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Delete paragraph"
                        onClick={() =>
                          updateDraft((prev) => ({
                            ...prev,
                            about: {
                              ...prev.about,
                              bio: prev.about.bio.filter((_, i) => i !== idx),
                            },
                          }))
                        }
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Facts */}
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Quick Facts Card</h2>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateDraft((prev) => ({
                        ...prev,
                        about: {
                          ...prev.about,
                          quickFacts: [
                            ...prev.about.quickFacts,
                            { label: "New Fact", value: "Value" },
                          ],
                        },
                      }))
                    }
                  >
                    <Plus className="h-4 w-4" />
                    Add Fact
                  </Button>
                </div>

                <div className="space-y-3">
                  {draft.about.quickFacts.map((fact, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 gap-2 sm:grid-cols-12"
                    >
                      <div className="sm:col-span-4">
                        <Input
                          value={fact.label}
                          placeholder="Label (e.g. Location)"
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft((prev) => {
                              const next = [...prev.about.quickFacts];
                              next[idx] = { ...next[idx], label: val };
                              return {
                                ...prev,
                                about: { ...prev.about, quickFacts: next },
                              };
                            });
                          }}
                        />
                      </div>
                      <div className="sm:col-span-7">
                        <Input
                          value={fact.value}
                          placeholder="Value"
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft((prev) => {
                              const next = [...prev.about.quickFacts];
                              next[idx] = { ...next[idx], value: val };
                              return {
                                ...prev,
                                about: { ...prev.about, quickFacts: next },
                              };
                            });
                          }}
                        />
                      </div>
                      <div className="sm:col-span-1 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Remove fact"
                          onClick={() =>
                            updateDraft((prev) => ({
                              ...prev,
                              about: {
                                ...prev.about,
                                quickFacts: prev.about.quickFacts.filter(
                                  (_, i) => i !== idx
                                ),
                              },
                            }))
                          }
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROJECTS MANAGER */}
          {activeTab === "projects" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">Projects Manager</h1>
                  <p className="text-sm text-muted-foreground">
                    Add new projects, upload project screenshots, or edit links
                    and descriptions.
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={() =>
                    updateDraft((prev) => ({
                      ...prev,
                      projects: [
                        {
                          name: "New Project Title",
                          description:
                            "Describe the project scope, methodology, and impact.",
                          tech: ["R", "SPSS", "Statistical Modeling"],
                          live: "",
                          github: "",
                          image: "/images/projects/survival-model.png",
                        },
                        ...prev.projects,
                      ],
                    }))
                  }
                >
                  <Plus className="h-4 w-4" />
                  Add Project
                </Button>
              </div>

              <div className="space-y-6">
                {draft.projects.map((project, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-border bg-card p-6 space-y-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
                      <span className="font-semibold text-foreground">
                        Project #{idx + 1}: {project.name}
                      </span>

                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={idx === 0}
                          aria-label="Move project up"
                          onClick={() =>
                            updateDraft((prev) => {
                              const next = [...prev.projects];
                              [next[idx - 1], next[idx]] = [
                                next[idx],
                                next[idx - 1],
                              ];
                              return { ...prev, projects: next };
                            })
                          }
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={idx === draft.projects.length - 1}
                          aria-label="Move project down"
                          onClick={() =>
                            updateDraft((prev) => {
                              const next = [...prev.projects];
                              [next[idx], next[idx + 1]] = [
                                next[idx + 1],
                                next[idx],
                              ];
                              return { ...prev, projects: next };
                            })
                          }
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Delete project"
                          onClick={() =>
                            updateDraft((prev) => ({
                              ...prev,
                              projects: prev.projects.filter(
                                (_, i) => i !== idx
                              ),
                            }))
                          }
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    {/* Image Upload + Preview */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                      <div className="space-y-3 md:col-span-4">
                        <div className="relative h-40 w-full overflow-hidden rounded-lg border border-border bg-muted">
                          <Image
                            src={
                              project.image ||
                              "/images/projects/survival-model.png"
                            }
                            alt={project.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs font-medium hover:bg-muted">
                          <Upload className="h-3.5 w-3.5" />
                          {uploadingKey === `project-${idx}`
                            ? "Uploading..."
                            : "Upload / Replace Picture"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) {
                                void handleFileUpload(
                                  f,
                                  "project",
                                  `project-${idx}`,
                                  (url) => {
                                    updateDraft((prev) => {
                                      const next = [...prev.projects];
                                      next[idx] = { ...next[idx], image: url };
                                      return { ...prev, projects: next };
                                    });
                                  }
                                );
                              }
                            }}
                          />
                        </label>

                        <Input
                          value={project.image}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft((prev) => {
                              const next = [...prev.projects];
                              next[idx] = { ...next[idx], image: val };
                              return { ...prev, projects: next };
                            });
                          }}
                          placeholder="Image path or URL"
                          className="text-xs"
                        />
                      </div>

                      {/* Project Details */}
                      <div className="space-y-4 md:col-span-8">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium">
                            Project Name
                          </label>
                          <Input
                            value={project.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateDraft((prev) => {
                                const next = [...prev.projects];
                                next[idx] = { ...next[idx], name: val };
                                return { ...prev, projects: next };
                              });
                            }}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-sm font-medium">
                            Description
                          </label>
                          <Textarea
                            rows={3}
                            value={project.description}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateDraft((prev) => {
                                const next = [...prev.projects];
                                next[idx] = {
                                  ...next[idx],
                                  description: val,
                                };
                                return { ...prev, projects: next };
                              });
                            }}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-sm font-medium">
                            Tech Stack / Tags (comma-separated)
                          </label>
                          <Input
                            value={project.tech.join(", ")}
                            onChange={(e) => {
                              const tags = e.target.value
                                .split(",")
                                .map((t) => t.trim())
                                .filter(Boolean);
                              updateDraft((prev) => {
                                const next = [...prev.projects];
                                next[idx] = { ...next[idx], tech: tags };
                                return { ...prev, projects: next };
                              });
                            }}
                            placeholder="R, SPSS, Survival Analysis"
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium">
                              Live / Paper URL (optional)
                            </label>
                            <Input
                              value={project.live}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateDraft((prev) => {
                                  const next = [...prev.projects];
                                  next[idx] = { ...next[idx], live: val };
                                  return { ...prev, projects: next };
                                });
                              }}
                              placeholder="https://ssrn.com/..."
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-sm font-medium">
                              GitHub URL (optional)
                            </label>
                            <Input
                              value={project.github}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateDraft((prev) => {
                                  const next = [...prev.projects];
                                  next[idx] = { ...next[idx], github: val };
                                  return { ...prev, projects: next };
                                });
                              }}
                              placeholder="https://github.com/..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: EXPERIENCE TIMELINE */}
          {activeTab === "experience" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">Work Experience</h1>
                  <p className="text-sm text-muted-foreground">
                    Add, reorder, or edit roles in your career timeline.
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={() =>
                    updateDraft((prev) => ({
                      ...prev,
                      experience: [
                        {
                          role: "Data Analyst",
                          company: "Organization Name",
                          location: "Kaduna, Nigeria",
                          start: "Jan 2025",
                          end: "Present",
                          bullets: ["Key responsibility or achievement."],
                          tech: ["R", "SPSS", "Excel"],
                        },
                        ...prev.experience,
                      ],
                    }))
                  }
                >
                  <Plus className="h-4 w-4" />
                  Add Role
                </Button>
              </div>

              <div className="space-y-6">
                {draft.experience.map((job, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-border bg-card p-6 space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <span className="font-semibold">
                        {job.role} — {job.company}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={idx === 0}
                          onClick={() =>
                            updateDraft((prev) => {
                              const next = [...prev.experience];
                              [next[idx - 1], next[idx]] = [
                                next[idx],
                                next[idx - 1],
                              ];
                              return { ...prev, experience: next };
                            })
                          }
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={idx === draft.experience.length - 1}
                          onClick={() =>
                            updateDraft((prev) => {
                              const next = [...prev.experience];
                              [next[idx], next[idx + 1]] = [
                                next[idx + 1],
                                next[idx],
                              ];
                              return { ...prev, experience: next };
                            })
                          }
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            updateDraft((prev) => ({
                              ...prev,
                              experience: prev.experience.filter(
                                (_, i) => i !== idx
                              ),
                            }))
                          }
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Role</label>
                        <Input
                          value={job.role}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft((prev) => {
                              const next = [...prev.experience];
                              next[idx] = { ...next[idx], role: val };
                              return { ...prev, experience: next };
                            });
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Company</label>
                        <Input
                          value={job.company}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft((prev) => {
                              const next = [...prev.experience];
                              next[idx] = { ...next[idx], company: val };
                              return { ...prev, experience: next };
                            });
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Location</label>
                        <Input
                          value={job.location}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft((prev) => {
                              const next = [...prev.experience];
                              next[idx] = { ...next[idx], location: val };
                              return { ...prev, experience: next };
                            });
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-xs font-medium">Start</label>
                          <Input
                            value={job.start}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateDraft((prev) => {
                                const next = [...prev.experience];
                                next[idx] = { ...next[idx], start: val };
                                return { ...prev, experience: next };
                              });
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium">End</label>
                          <Input
                            value={job.end}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateDraft((prev) => {
                                const next = [...prev.experience];
                                next[idx] = { ...next[idx], end: val };
                                return { ...prev, experience: next };
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">
                        Bullet Points (one per line)
                      </label>
                      <Textarea
                        rows={4}
                        value={job.bullets.join("\n")}
                        onChange={(e) => {
                          const lines = e.target.value
                            .split("\n")
                            .filter((line) => line.trim().length > 0);
                          updateDraft((prev) => {
                            const next = [...prev.experience];
                            next[idx] = { ...next[idx], bullets: lines };
                            return { ...prev, experience: next };
                          });
                        }}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">
                        Tools / Tech Used (comma-separated)
                      </label>
                      <Input
                        value={job.tech.join(", ")}
                        onChange={(e) => {
                          const tech = e.target.value
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean);
                          updateDraft((prev) => {
                            const next = [...prev.experience];
                            next[idx] = { ...next[idx], tech };
                            return { ...prev, experience: next };
                          });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SKILLS MANAGER */}
          {activeTab === "skills" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">Skills &amp; Tools</h1>
                  <p className="text-sm text-muted-foreground">
                    Organize your statistical software, analytical methods, and
                    transferable skills.
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={() =>
                    updateDraft((prev) => ({
                      ...prev,
                      skills: [
                        ...prev.skills,
                        { category: "New Skill Category", items: ["Skill 1"] },
                      ],
                    }))
                  }
                >
                  <Plus className="h-4 w-4" />
                  Add Category
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {draft.skills.map((group, gIdx) => (
                  <div
                    key={gIdx}
                    className="rounded-xl border border-border bg-card p-5 space-y-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Input
                        value={group.category}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraft((prev) => {
                            const next = [...prev.skills];
                            next[gIdx] = { ...next[gIdx], category: val };
                            return { ...prev, skills: next };
                          });
                        }}
                        className="font-semibold"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          updateDraft((prev) => ({
                            ...prev,
                            skills: prev.skills.filter((_, i) => i !== gIdx),
                          }))
                        }
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {group.items.map((item, iIdx) => (
                        <Badge
                          key={`${item}-${iIdx}`}
                          variant="secondary"
                          className="flex items-center gap-1.5 py-1 pl-2.5 pr-1.5"
                        >
                          <span>{item}</span>
                          <button
                            type="button"
                            onClick={() =>
                              updateDraft((prev) => {
                                const next = [...prev.skills];
                                next[gIdx] = {
                                  ...next[gIdx],
                                  items: next[gIdx].items.filter(
                                    (_, idx) => idx !== iIdx
                                  ),
                                };
                                return { ...prev, skills: next };
                              })
                            }
                            className="rounded-full p-0.5 hover:bg-background/50 text-muted-foreground hover:text-foreground"
                            aria-label={`Remove ${item}`}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Add skill badge..."
                        value={newSkillInputs[gIdx] ?? ""}
                        onChange={(e) =>
                          setNewSkillInputs((prev) => ({
                            ...prev,
                            [gIdx]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const val = (newSkillInputs[gIdx] ?? "").trim();
                            if (!val) return;
                            updateDraft((prev) => {
                              const next = [...prev.skills];
                              next[gIdx] = {
                                ...next[gIdx],
                                items: [...next[gIdx].items, val],
                              };
                              return { ...prev, skills: next };
                            });
                            setNewSkillInputs((prev) => ({
                              ...prev,
                              [gIdx]: "",
                            }));
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const val = (newSkillInputs[gIdx] ?? "").trim();
                          if (!val) return;
                          updateDraft((prev) => {
                            const next = [...prev.skills];
                            next[gIdx] = {
                              ...next[gIdx],
                              items: [...next[gIdx].items, val],
                            };
                            return { ...prev, skills: next };
                          });
                          setNewSkillInputs((prev) => ({
                            ...prev,
                            [gIdx]: "",
                          }));
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: ACADEMIC (PUBLICATIONS, EDUCATION, CERTIFICATIONS, REFEREES) */}
          {activeTab === "academic" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold">
                  Publications, Education &amp; Credentials
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage your research publications, academic degrees,
                  certifications, professional memberships, and referees.
                </p>
              </div>

              {/* Section Visibility Controls */}
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <h2 className="text-lg font-semibold">
                  Public Section Visibility
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {(
                    [
                      { key: "publications", label: "Show Publications" },
                      { key: "education", label: "Show Education" },
                      {
                        key: "certifications",
                        label: "Show Certifications & Memberships",
                      },
                      { key: "referees", label: "Show Referees Section" },
                      {
                        key: "showRefereeContacts",
                        label: "Show Referee Phone/Email Publicly",
                      },
                    ] as const
                  ).map((item) => {
                    const enabled = draft.visibility[item.key];
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() =>
                          updateDraft((prev) => ({
                            ...prev,
                            visibility: {
                              ...prev.visibility,
                              [item.key]: !prev.visibility[item.key],
                            },
                          }))
                        }
                        className={cn(
                          "flex items-center justify-between rounded-lg border p-3 text-left text-sm font-medium transition-colors",
                          enabled
                            ? "border-primary/40 bg-primary/10 text-foreground"
                            : "border-border bg-background text-muted-foreground"
                        )}
                      >
                        <span>{item.label}</span>
                        {enabled ? (
                          <Eye className="h-4 w-4 text-primary" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Publications Editor */}
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    Publications ({draft.publications.length})
                  </h2>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateDraft((prev) => ({
                        ...prev,
                        publications: [
                          {
                            title: "New Research Publication Title",
                            authors: "Lawal, A., et al.",
                            venue: "Journal or Conference Name",
                            year: new Date().getFullYear().toString(),
                            volume: "",
                            issn: "",
                            link: "",
                          },
                          ...prev.publications,
                        ],
                      }))
                    }
                  >
                    <Plus className="h-4 w-4" />
                    Add Publication
                  </Button>
                </div>

                <div className="space-y-4">
                  {draft.publications.map((pub, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-border bg-background p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">
                          Paper #{idx + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            updateDraft((prev) => ({
                              ...prev,
                              publications: prev.publications.filter(
                                (_, i) => i !== idx
                              ),
                            }))
                          }
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <Input
                            value={pub.title}
                            placeholder="Paper Title"
                            onChange={(e) => {
                              const val = e.target.value;
                              updateDraft((prev) => {
                                const next = [...prev.publications];
                                next[idx] = { ...next[idx], title: val };
                                return { ...prev, publications: next };
                              });
                            }}
                          />
                        </div>
                        <Input
                          value={pub.authors}
                          placeholder="Authors"
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft((prev) => {
                              const next = [...prev.publications];
                              next[idx] = { ...next[idx], authors: val };
                              return { ...prev, publications: next };
                            });
                          }}
                        />
                        <Input
                          value={pub.venue}
                          placeholder="Journal / Conference Venue"
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft((prev) => {
                              const next = [...prev.publications];
                              next[idx] = { ...next[idx], venue: val };
                              return { ...prev, publications: next };
                            });
                          }}
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <Input
                            value={pub.year}
                            placeholder="Year"
                            onChange={(e) => {
                              const val = e.target.value;
                              updateDraft((prev) => {
                                const next = [...prev.publications];
                                next[idx] = { ...next[idx], year: val };
                                return { ...prev, publications: next };
                              });
                            }}
                          />
                          <Input
                            value={pub.volume ?? ""}
                            placeholder="Volume"
                            onChange={(e) => {
                              const val = e.target.value;
                              updateDraft((prev) => {
                                const next = [...prev.publications];
                                next[idx] = { ...next[idx], volume: val };
                                return { ...prev, publications: next };
                              });
                            }}
                          />
                          <Input
                            value={pub.issn ?? ""}
                            placeholder="ISSN"
                            onChange={(e) => {
                              const val = e.target.value;
                              updateDraft((prev) => {
                                const next = [...prev.publications];
                                next[idx] = { ...next[idx], issn: val };
                                return { ...prev, publications: next };
                              });
                            }}
                          />
                        </div>
                        <Input
                          value={pub.link ?? ""}
                          placeholder="External Link (e.g. https://ssrn.com/...)"
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft((prev) => {
                              const next = [...prev.publications];
                              next[idx] = { ...next[idx], link: val };
                              return { ...prev, publications: next };
                            });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education Editor */}
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Education</h2>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateDraft((prev) => ({
                        ...prev,
                        education: [
                          ...prev.education,
                          {
                            degree: "Degree Title",
                            school: "University Name",
                            location: "Location",
                            year: "2020 – 2024",
                            grade: "First Class",
                          },
                        ],
                      }))
                    }
                  >
                    <Plus className="h-4 w-4" />
                    Add Degree
                  </Button>
                </div>

                <div className="space-y-4">
                  {draft.education.map((edu, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-background p-4 sm:grid-cols-12"
                    >
                      <div className="sm:col-span-3">
                        <Input
                          value={edu.degree}
                          placeholder="Degree"
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft((prev) => {
                              const next = [...prev.education];
                              next[idx] = { ...next[idx], degree: val };
                              return { ...prev, education: next };
                            });
                          }}
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <Input
                          value={edu.school}
                          placeholder="School"
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft((prev) => {
                              const next = [...prev.education];
                              next[idx] = { ...next[idx], school: val };
                              return { ...prev, education: next };
                            });
                          }}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Input
                          value={edu.location}
                          placeholder="Location"
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft((prev) => {
                              const next = [...prev.education];
                              next[idx] = { ...next[idx], location: val };
                              return { ...prev, education: next };
                            });
                          }}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Input
                          value={edu.year}
                          placeholder="Years"
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft((prev) => {
                              const next = [...prev.education];
                              next[idx] = { ...next[idx], year: val };
                              return { ...prev, education: next };
                            });
                          }}
                        />
                      </div>
                      <div className="sm:col-span-2 flex gap-1">
                        <Input
                          value={edu.grade}
                          placeholder="Grade"
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft((prev) => {
                              const next = [...prev.education];
                              next[idx] = { ...next[idx], grade: val };
                              return { ...prev, education: next };
                            });
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            updateDraft((prev) => ({
                              ...prev,
                              education: prev.education.filter(
                                (_, i) => i !== idx
                              ),
                            }))
                          }
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications & Memberships */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-6 space-y-3">
                  <h2 className="text-lg font-semibold">
                    Certifications (one per line)
                  </h2>
                  <Textarea
                    rows={5}
                    value={draft.certifications.join("\n")}
                    onChange={(e) => {
                      const lines = e.target.value
                        .split("\n")
                        .filter((l) => l.trim().length > 0);
                      updateDraft((prev) => ({
                        ...prev,
                        certifications: lines,
                      }));
                    }}
                  />
                </div>

                <div className="rounded-xl border border-border bg-card p-6 space-y-3">
                  <h2 className="text-lg font-semibold">
                    Professional Memberships (one per line)
                  </h2>
                  <Textarea
                    rows={5}
                    value={draft.memberships.join("\n")}
                    onChange={(e) => {
                      const lines = e.target.value
                        .split("\n")
                        .filter((l) => l.trim().length > 0);
                      updateDraft((prev) => ({
                        ...prev,
                        memberships: lines,
                      }));
                    }}
                  />
                </div>
              </div>

              {/* Referees */}
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Referees</h2>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateDraft((prev) => ({
                        ...prev,
                        referees: [
                          ...prev.referees,
                          {
                            name: "Referee Name",
                            role: "Role / Title",
                            org: "Institution",
                            phone: "",
                            email: "",
                          },
                        ],
                      }))
                    }
                  >
                    <Plus className="h-4 w-4" />
                    Add Referee
                  </Button>
                </div>

                <div className="space-y-3">
                  {draft.referees.map((ref, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-background p-4 sm:grid-cols-12"
                    >
                      <div className="sm:col-span-2">
                        <Input
                          value={ref.name}
                          placeholder="Name"
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft((prev) => {
                              const next = [...prev.referees];
                              next[idx] = { ...next[idx], name: val };
                              return { ...prev, referees: next };
                            });
                          }}
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <Input
                          value={ref.role}
                          placeholder="Role"
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft((prev) => {
                              const next = [...prev.referees];
                              next[idx] = { ...next[idx], role: val };
                              return { ...prev, referees: next };
                            });
                          }}
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <Input
                          value={ref.org}
                          placeholder="Organization"
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft((prev) => {
                              const next = [...prev.referees];
                              next[idx] = { ...next[idx], org: val };
                              return { ...prev, referees: next };
                            });
                          }}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Input
                          value={ref.phone}
                          placeholder="Phone"
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft((prev) => {
                              const next = [...prev.referees];
                              next[idx] = { ...next[idx], phone: val };
                              return { ...prev, referees: next };
                            });
                          }}
                        />
                      </div>
                      <div className="sm:col-span-2 flex gap-1">
                        <Input
                          value={ref.email}
                          placeholder="Email"
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraft((prev) => {
                              const next = [...prev.referees];
                              next[idx] = { ...next[idx], email: val };
                              return { ...prev, referees: next };
                            });
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            updateDraft((prev) => ({
                              ...prev,
                              referees: prev.referees.filter(
                                (_, i) => i !== idx
                              ),
                            }))
                          }
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: CV, MEDIA & SOCIAL LINKS */}
          {activeTab === "media" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold">
                  CV Document &amp; Social Links
                </h1>
                <p className="text-sm text-muted-foreground">
                  Upload your real Curriculum Vitae PDF, social preview image,
                  and manage your contact details.
                </p>
              </div>

              {/* CV Upload Card */}
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <h2 className="text-lg font-semibold">
                  Curriculum Vitae (PDF)
                </h2>
                <p className="text-sm text-muted-foreground">
                  Uploading a PDF here replaces `/documents/cv.pdf` across all
                  &ldquo;Download CV&rdquo; buttons on your portfolio.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                    <Upload className="h-4 w-4" />
                    {uploadingKey === "cv"
                      ? "Uploading PDF..."
                      : "Upload Real CV (PDF)"}
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          void handleFileUpload(f, "cv", "cv", (url) => {
                            updateDraft((prev) => ({
                              ...prev,
                              about: { ...prev.about, cvUrl: url },
                            }));
                          });
                        }
                      }}
                    />
                  </label>

                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={draft.about.cvUrl || "/documents/cv.pdf"}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Preview Current CV
                    </a>
                  </Button>
                </div>
              </div>

              {/* Contact & Social Links */}
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <h2 className="text-lg font-semibold">
                  Contact &amp; Social Profiles
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Email Address</label>
                    <Input
                      type="email"
                      value={draft.socials.email}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft((prev) => ({
                          ...prev,
                          about: { ...prev.about, email: val },
                          socials: { ...prev.socials, email: val },
                        }));
                      }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Phone Number</label>
                    <Input
                      value={draft.socials.phone}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateDraft((prev) => ({
                          ...prev,
                          about: { ...prev.about, phone: val },
                          socials: { ...prev.socials, phone: val },
                        }));
                      }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">LinkedIn URL</label>
                    <Input
                      value={draft.socials.linkedin}
                      onChange={(e) =>
                        updateDraft((prev) => ({
                          ...prev,
                          socials: {
                            ...prev.socials,
                            linkedin: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">GitHub URL</label>
                    <Input
                      value={draft.socials.github}
                      onChange={(e) =>
                        updateDraft((prev) => ({
                          ...prev,
                          socials: { ...prev.socials, github: e.target.value },
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-sm font-medium">
                      Formspree Endpoint URL (optional email forwarding)
                    </label>
                    <Input
                      value={draft.socials.formspreeUrl ?? ""}
                      onChange={(e) =>
                        updateDraft((prev) => ({
                          ...prev,
                          socials: {
                            ...prev.socials,
                            formspreeUrl: e.target.value,
                          },
                        }))
                      }
                      placeholder="https://formspree.io/f/your_form_id (messages are also saved in the Messages tab)"
                    />
                  </div>
                </div>
              </div>

              {/* OpenGraph Image */}
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <h2 className="text-lg font-semibold">
                  OpenGraph Social Share Banner (1200×630)
                </h2>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="relative h-28 w-52 overflow-hidden rounded-lg border border-border bg-muted">
                    <Image
                      src={draft.seo.ogImage || "/images/og-image.png"}
                      alt="OpenGraph preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted">
                    <Upload className="h-4 w-4" />
                    {uploadingKey === "og"
                      ? "Uploading..."
                      : "Upload Social Share Banner"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          void handleFileUpload(f, "og", "og", (url) => {
                            updateDraft((prev) => ({
                              ...prev,
                              seo: { ...prev.seo, ogImage: url },
                            }));
                          });
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: CONTACT MESSAGES INBOX */}
          {activeTab === "inbox" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">Contact Form Inbox</h1>
                <p className="text-sm text-muted-foreground">
                  Messages submitted through the &ldquo;Get In Touch&rdquo; form
                  on your portfolio appear here automatically.
                </p>
              </div>

              {!draft.messages || draft.messages.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
                  No messages received yet. Try submitting a test message from
                  the Contact section on your home page!
                </div>
              ) : (
                <div className="space-y-4">
                  {draft.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "rounded-xl border p-5 space-y-3 transition-colors",
                        msg.read
                          ? "border-border bg-card"
                          : "border-primary/50 bg-primary/5"
                      )}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {!msg.read && <Badge>New</Badge>}
                          <h3 className="font-semibold text-foreground">
                            {msg.name}
                          </h3>
                          <a
                            href={`mailto:${msg.email}`}
                            className="text-sm text-primary hover:underline"
                          >
                            &lt;{msg.email}&gt;
                          </a>
                        </div>

                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <p className="whitespace-pre-wrap text-sm text-foreground">
                        {msg.message}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        <Button size="sm" variant="outline" asChild>
                          <a
                            href={`mailto:${msg.email}?subject=Re: Portfolio Inquiry`}
                          >
                            <Mail className="h-3.5 w-3.5" />
                            Reply via Email
                          </a>
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            void handleToggleMessageRead(msg.id, !msg.read)
                          }
                        >
                          <Check className="h-3.5 w-3.5" />
                          {msg.read ? "Mark Unread" : "Mark as Read"}
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void handleDeleteMessage(msg.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 9: SEO, BACKUP & SECURITY SETTINGS */}
          {activeTab === "settings" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold">
                  SEO, Backups &amp; Security
                </h1>
                <p className="text-sm text-muted-foreground">
                  Configure search engine metadata, export/import JSON backups,
                  or update your admin password.
                </p>
              </div>

              {/* SEO Metadata */}
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <h2 className="text-lg font-semibold">SEO &amp; Metadata</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-sm font-medium">Site Title</label>
                    <Input
                      value={draft.seo.title}
                      onChange={(e) =>
                        updateDraft((prev) => ({
                          ...prev,
                          seo: { ...prev.seo, title: e.target.value },
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-sm font-medium">
                      Meta Description
                    </label>
                    <Textarea
                      rows={3}
                      value={draft.seo.description}
                      onChange={(e) =>
                        updateDraft((prev) => ({
                          ...prev,
                          seo: { ...prev.seo, description: e.target.value },
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">
                      Production Domain URL
                    </label>
                    <Input
                      value={draft.seo.url}
                      onChange={(e) =>
                        updateDraft((prev) => ({
                          ...prev,
                          seo: { ...prev.seo, url: e.target.value },
                        }))
                      }
                      placeholder="https://abdulfatailawal.vercel.app"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">
                      Keywords (comma-separated)
                    </label>
                    <Input
                      value={draft.seo.keywords.join(", ")}
                      onChange={(e) =>
                        updateDraft((prev) => ({
                          ...prev,
                          seo: {
                            ...prev.seo,
                            keywords: e.target.value
                              .split(",")
                              .map((k) => k.trim())
                              .filter(Boolean),
                          },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Backup & Restore */}
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <h2 className="text-lg font-semibold">
                  Backup, Import &amp; Reset
                </h2>
                <p className="text-sm text-muted-foreground">
                  Download a full JSON snapshot of your portfolio at any time or
                  restore from a backup file.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleExportJson}
                  >
                    <Download className="h-4 w-4" />
                    Export JSON Backup
                  </Button>

                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted">
                    <Upload className="h-4 w-4" />
                    Import JSON Backup
                    <input
                      type="file"
                      accept=".json,application/json"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleImportJson(f);
                      }}
                    />
                  </label>

                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => void handleResetDefaults()}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset to Default Content
                  </Button>
                </div>
              </div>

              {/* Admin Password Change */}
              <form
                onSubmit={handleChangePassword}
                className="rounded-xl border border-border bg-card p-6 space-y-4"
              >
                <h2 className="text-lg font-semibold">Change Admin Password</h2>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    type="password"
                    value={newAdminPass}
                    onChange={(e) => setNewAdminPass(e.target.value)}
                    placeholder="Enter new admin password (min 4 chars)"
                    className="max-w-sm"
                  />
                  <Button type="submit" variant="outline">
                    Update Password
                  </Button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

