"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import {
  ShieldCheck,
  Lock,
  Edit3,
  Upload,
  Plus,
  Trash2,
  Save,
  X,
  LogOut,
  ExternalLink,
  KeyRound,
  FolderKanban,
  User,
  Briefcase,
  Wrench,
  BookOpen,
  FileText,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  defaultContent,
  type ContactMessage,
  type PortfolioContent,
  type PortfolioData,
} from "@/lib/portfolio-types";
import { cn } from "@/lib/utils";

type QuickSection =
  | "profile"
  | "projects"
  | "skills"
  | "experience"
  | "publications"
  | "cv"
  | "inbox"
  | "password";

export function FrontendAdminBar() {
  const pathname = usePathname();
  const router = useRouter();

  const [authenticated, setAuthenticated] = useState(false);
  const [storage, setStorage] = useState<"blob" | "local">("local");
  const [usingInitialPass, setUsingInitialPass] = useState(false);

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [section, setSection] = useState<QuickSection>("profile");

  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [draft, setDraft] = useState<PortfolioData>({
    ...defaultContent,
    messages: [],
  });
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Password change fields
  const [currPass, setCurrPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confPass, setConfPass] = useState("");

  // New skill badge input
  const [skillInputs, setSkillInputs] = useState<Record<number, string>>({});

  const notify = (type: "success" | "error", text: string) => {
    setNotice({ type, text });
    setTimeout(() => {
      setNotice((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  // Match active drawer tab to the current frontend route automatically
  useEffect(() => {
    if (pathname.startsWith("/projects")) setSection("projects");
    else if (pathname.startsWith("/skills")) setSection("skills");
    else if (pathname.startsWith("/experience")) setSection("experience");
    else if (pathname.startsWith("/publications")) setSection("publications");
    else if (pathname.startsWith("/contact")) setSection("inbox");
    else setSection("profile");
  }, [pathname]);

  const loadAdminData = useCallback(async () => {
    const res = await fetch("/api/admin/data", { cache: "no-store" });
    if (!res.ok) return;
    const { content, messages } = (await res.json()) as {
      content: PortfolioContent;
      messages: ContactMessage[];
    };
    setDraft({ ...content, messages });
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        if (!res.ok) return;
        const s = (await res.json()) as {
          authenticated: boolean;
          storage: "blob" | "local";
          usingDevDefault: boolean;
        };
        setStorage(s.storage);
        setUsingInitialPass(s.usingDevDefault);
        if (s.authenticated) {
          setAuthenticated(true);
          await loadAdminData();
        }
      } catch {
        // Ignore network errors on initial check
      }
    };
    void checkSession();
  }, [loadAdminData]);

  // Listen for custom event from Navbar / Footer "Admin Mode" button
  useEffect(() => {
    const handleOpenAdmin = () => {
      if (authenticated) {
        setDrawerOpen(true);
      } else {
        setLoginModalOpen(true);
      }
    };
    window.addEventListener("open-frontend-admin", handleOpenAdmin);
    return () =>
      window.removeEventListener("open-frontend-admin", handleOpenAdmin);
  }, [authenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoggingIn(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });
      if (res.ok) {
        setPasswordInput("");
        setAuthenticated(true);
        setLoginModalOpen(false);
        await loadAdminData();
        setDrawerOpen(true);
        notify("success", "Admin Mode unlocked! You can now edit and upload live.");
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setLoginError(data.error ?? "Incorrect password.");
      }
    } catch {
      setLoginError("Could not connect to server.");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    setAuthenticated(false);
    setDrawerOpen(false);
    notify("success", "Exited Admin Mode.");
  };

  const handleSave = async (nextData?: PortfolioData) => {
    const payload = nextData ?? draft;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save failed");
      const { content } = (await res.json()) as { content: PortfolioContent };
      setDraft((prev) => ({ ...content, messages: prev.messages }));
      router.refresh();
      notify("success", "Saved! Changes are live on this page.");
    } catch {
      notify("error", "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (
    file: File,
    category: "profile" | "project" | "cv" | "og",
    keyId: string,
    onDone: (url: string, downloadUrl: string) => void
  ) => {
    setUploadingKey(keyId);
    try {
      if (storage === "blob") {
        const safeName =
          file.name.toLowerCase().replace(/[^a-z0-9.\-_]/g, "-") || "file";
        const blob = await upload(`uploads/${category}/${safeName}`, file, {
          access: "public",
          handleUploadUrl: "/api/admin/blob-upload",
        });
        onDone(blob.url, blob.downloadUrl);
      } else {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("category", category);
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: fd,
        });
        if (!res.ok) throw new Error("Upload failed");
        const data = (await res.json()) as { url: string; downloadUrl: string };
        onDone(data.url, data.downloadUrl);
      }
      notify("success", `Uploaded "${file.name}"! Click Save & Publish to apply.`);
    } catch {
      notify("error", "File upload failed.");
    } finally {
      setUploadingKey(null);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass.length < 6) {
      notify("error", "New password must be at least 6 characters.");
      return;
    }
    if (newPass !== confPass) {
      notify("error", "New passwords do not match.");
      return;
    }
    const res = await fetch("/api/auth/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: currPass, newPassword: newPass }),
    });
    if (res.ok) {
      setCurrPass("");
      setNewPass("");
      setConfPass("");
      setUsingInitialPass(false);
      notify("success", "Admin password updated! Only your new password works now.");
    } else {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      notify("error", d.error ?? "Failed to change password.");
    }
  };

  const unreadCount = (draft.messages ?? []).filter((m) => !m.read).length;

  return (
    <>
      {/* Toast Notice */}
      {notice && (
        <div className="fixed bottom-20 right-4 z-[90] max-w-sm rounded-xl border border-border bg-card px-4 py-3 shadow-xl">
          <p
            className={cn(
              "text-sm font-medium",
              notice.type === "success"
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            )}
          >
            {notice.text}
          </p>
        </div>
      )}

      {/* Floating Bottom Bar on Frontend */}
      <div className="fixed bottom-4 right-4 z-[70] flex items-center gap-2">
        {!authenticated ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setLoginModalOpen(true)}
            className="rounded-full border-primary/30 bg-card/95 px-4 shadow-lg backdrop-blur hover:border-primary"
          >
            <Lock className="h-3.5 w-3.5 text-primary" />
            Admin Mode
          </Button>
        ) : (
          <div className="flex items-center gap-2 rounded-full border border-primary/40 bg-card/95 p-1.5 pl-3 shadow-xl backdrop-blur">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <ShieldCheck className="h-4 w-4" />
              Admin Mode
            </span>

            <Button
              size="sm"
              onClick={() => setDrawerOpen(true)}
              className="h-8 rounded-full px-3 text-xs"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit &amp; Upload
            </Button>

            <Button
              size="sm"
              variant="outline"
              asChild
              className="h-8 rounded-full px-3 text-xs"
            >
              <Link href="/admin">
                <ExternalLink className="h-3.5 w-3.5" />
                Full Studio
              </Link>
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={handleLogout}
              className="h-8 w-8 rounded-full"
              aria-label="Exit Admin Mode"
              title="Exit Admin Mode"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Login Modal directly on Frontend */}
      {loginModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-5 rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    Unlock Admin Mode
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Edit content, add projects, and upload photos right on the
                    page.
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLoginModalOpen(false)}
                aria-label="Close login modal"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="frontend-admin-password"
                  className="text-sm font-medium text-foreground"
                >
                  Admin Password
                </label>
                <Input
                  id="frontend-admin-password"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder={
                    usingInitialPass
                      ? "Enter password (default: admin123)"
                      : "Enter your admin password"
                  }
                  required
                  autoFocus
                />
              </div>

              {loginError && (
                <p className="text-xs font-medium text-red-500">{loginError}</p>
              )}

              <div className="flex items-center justify-between gap-2 pt-1">
                {usingInitialPass ? (
                  <span className="text-xs text-muted-foreground">
                    Initial password: <code>admin123</code>
                  </span>
                ) : (
                  <span />
                )}
                <Button type="submit" disabled={loggingIn}>
                  {loggingIn ? "Unlocking..." : "Unlock Admin Mode"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slide-Over Live Editor Drawer on the Frontend */}
      {authenticated && drawerOpen && (
        <div className="fixed inset-0 z-[80] flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="flex h-full w-full max-w-2xl flex-col border-l border-border bg-background shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-foreground">
                    Live Frontend Admin Editor
                  </h2>
                  <Badge variant="secondary" className="text-xs">
                    {storage === "blob" ? "Vercel Blob Live" : "Local Storage"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Edit any section or upload files below, then click{" "}
                  <strong>Save &amp; Publish</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => void handleSave()}
                  disabled={saving}
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save & Publish"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close editor"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Section Selector Pills */}
            <div className="flex gap-1.5 overflow-x-auto border-b border-border bg-muted/40 px-6 py-2.5">
              {(
                [
                  { id: "profile", label: "Profile & About", icon: User },
                  { id: "projects", label: "Projects", icon: FolderKanban },
                  { id: "skills", label: "Skills", icon: Wrench },
                  { id: "experience", label: "Experience", icon: Briefcase },
                  { id: "publications", label: "Academic", icon: BookOpen },
                  { id: "cv", label: "CV & Links", icon: FileText },
                  {
                    id: "inbox",
                    label: `Inbox (${unreadCount})`,
                    icon: Mail,
                  },
                  { id: "password", label: "Password", icon: KeyRound },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                const active = section === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSection(tab.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Drawer Body */}
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              {/* 1. PROFILE & ABOUT */}
              {section === "profile" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-primary/30 bg-muted">
                      <Image
                        src={draft.about.profileImage || "/images/profile.jpg"}
                        alt={draft.about.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">Profile Picture</p>
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
                        <Upload className="h-3.5 w-3.5" />
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
                              void handleUpload(
                                f,
                                "profile",
                                "profile",
                                (url) => {
                                  setDraft((prev) => ({
                                    ...prev,
                                    about: { ...prev.about, profileImage: url },
                                  }));
                                }
                              );
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Full Name</label>
                      <Input
                        value={draft.about.name}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            about: { ...prev.about, name: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Role / Title</label>
                      <Input
                        value={draft.about.role}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            about: { ...prev.about, role: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-medium">Tagline</label>
                      <Input
                        value={draft.about.tagline}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            about: { ...prev.about, tagline: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-medium">
                        Availability Badge
                      </label>
                      <Input
                        value={draft.about.availability}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            about: {
                              ...prev.about,
                              availability: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold">
                        Bio Paragraphs
                      </label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            about: {
                              ...prev.about,
                              bio: [...prev.about.bio, "New paragraph..."],
                            },
                          }))
                        }
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add
                      </Button>
                    </div>
                    {draft.about.bio.map((p, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Textarea
                          rows={3}
                          value={p}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDraft((prev) => {
                              const next = [...prev.about.bio];
                              next[idx] = val;
                              return {
                                ...prev,
                                about: { ...prev.about, bio: next },
                              };
                            });
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setDraft((prev) => ({
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
              )}

              {/* 2. PROJECTS */}
              {section === "projects" && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">
                      Projects ({draft.projects.length})
                    </h3>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          projects: [
                            {
                              name: "New Project",
                              description: "Project summary and findings.",
                              tech: ["R", "SPSS"],
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

                  {draft.projects.map((proj, idx) => (
                    <div
                      key={idx}
                      className="space-y-3 rounded-xl border border-border bg-card p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">
                          Project #{idx + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setDraft((prev) => ({
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

                      <div className="flex items-center gap-4">
                        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                          {proj.image && (
                            <Image
                              src={proj.image}
                              alt={proj.name}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted">
                          <Upload className="h-3.5 w-3.5" />
                          {uploadingKey === `proj-${idx}`
                            ? "Uploading..."
                            : "Upload Picture"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) {
                                void handleUpload(
                                  f,
                                  "project",
                                  `proj-${idx}`,
                                  (url) => {
                                    setDraft((prev) => {
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
                      </div>

                      <Input
                        value={proj.name}
                        placeholder="Project Name"
                        onChange={(e) => {
                          const val = e.target.value;
                          setDraft((prev) => {
                            const next = [...prev.projects];
                            next[idx] = { ...next[idx], name: val };
                            return { ...prev, projects: next };
                          });
                        }}
                      />
                      <Textarea
                        rows={2}
                        value={proj.description}
                        placeholder="Description"
                        onChange={(e) => {
                          const val = e.target.value;
                          setDraft((prev) => {
                            const next = [...prev.projects];
                            next[idx] = { ...next[idx], description: val };
                            return { ...prev, projects: next };
                          });
                        }}
                      />
                      <Input
                        value={proj.tech.join(", ")}
                        placeholder="Tech tags (comma-separated)"
                        onChange={(e) => {
                          const tags = e.target.value
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean);
                          setDraft((prev) => {
                            const next = [...prev.projects];
                            next[idx] = { ...next[idx], tech: tags };
                            return { ...prev, projects: next };
                          });
                        }}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={proj.live}
                          placeholder="Live / Paper URL"
                          onChange={(e) => {
                            const val = e.target.value;
                            setDraft((prev) => {
                              const next = [...prev.projects];
                              next[idx] = { ...next[idx], live: val };
                              return { ...prev, projects: next };
                            });
                          }}
                        />
                        <Input
                          value={proj.github}
                          placeholder="GitHub URL"
                          onChange={(e) => {
                            const val = e.target.value;
                            setDraft((prev) => {
                              const next = [...prev.projects];
                              next[idx] = { ...next[idx], github: val };
                              return { ...prev, projects: next };
                            });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 3. SKILLS */}
              {section === "skills" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Skill Categories</h3>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          skills: [
                            ...prev.skills,
                            { category: "New Category", items: ["Skill"] },
                          ],
                        }))
                      }
                    >
                      <Plus className="h-4 w-4" />
                      Add Category
                    </Button>
                  </div>

                  {draft.skills.map((grp, gIdx) => (
                    <div
                      key={gIdx}
                      className="space-y-3 rounded-xl border border-border bg-card p-4"
                    >
                      <div className="flex items-center gap-2">
                        <Input
                          value={grp.category}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDraft((prev) => {
                              const next = [...prev.skills];
                              next[gIdx] = { ...next[gIdx], category: val };
                              return { ...prev, skills: next };
                            });
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setDraft((prev) => ({
                              ...prev,
                              skills: prev.skills.filter((_, i) => i !== gIdx),
                            }))
                          }
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {grp.items.map((item, iIdx) => (
                          <Badge
                            key={`${item}-${iIdx}`}
                            variant="secondary"
                            className="gap-1"
                          >
                            {item}
                            <button
                              type="button"
                              onClick={() =>
                                setDraft((prev) => {
                                  const next = [...prev.skills];
                                  next[gIdx] = {
                                    ...next[gIdx],
                                    items: next[gIdx].items.filter(
                                      (_, i) => i !== iIdx
                                    ),
                                  };
                                  return { ...prev, skills: next };
                                })
                              }
                              className="ml-1 text-muted-foreground hover:text-foreground"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Input
                          placeholder="Add skill..."
                          value={skillInputs[gIdx] ?? ""}
                          onChange={(e) =>
                            setSkillInputs((p) => ({
                              ...p,
                              [gIdx]: e.target.value,
                            }))
                          }
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const v = (skillInputs[gIdx] ?? "").trim();
                            if (!v) return;
                            setDraft((prev) => {
                              const next = [...prev.skills];
                              next[gIdx] = {
                                ...next[gIdx],
                                items: [...next[gIdx].items, v],
                              };
                              return { ...prev, skills: next };
                            });
                            setSkillInputs((p) => ({ ...p, [gIdx]: "" }));
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 4. EXPERIENCE */}
              {section === "experience" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Work Experience</h3>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          experience: [
                            {
                              role: "Role Title",
                              company: "Organization",
                              location: "Nigeria",
                              start: "2024",
                              end: "Present",
                              bullets: ["Key responsibility"],
                              tech: ["R", "SPSS"],
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

                  {draft.experience.map((job, idx) => (
                    <div
                      key={idx}
                      className="space-y-3 rounded-xl border border-border bg-card p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-primary">
                          {job.role} · {job.company}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setDraft((prev) => ({
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
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={job.role}
                          placeholder="Role"
                          onChange={(e) => {
                            const val = e.target.value;
                            setDraft((prev) => {
                              const next = [...prev.experience];
                              next[idx] = { ...next[idx], role: val };
                              return { ...prev, experience: next };
                            });
                          }}
                        />
                        <Input
                          value={job.company}
                          placeholder="Company"
                          onChange={(e) => {
                            const val = e.target.value;
                            setDraft((prev) => {
                              const next = [...prev.experience];
                              next[idx] = { ...next[idx], company: val };
                              return { ...prev, experience: next };
                            });
                          }}
                        />
                        <Input
                          value={job.start}
                          placeholder="Start"
                          onChange={(e) => {
                            const val = e.target.value;
                            setDraft((prev) => {
                              const next = [...prev.experience];
                              next[idx] = { ...next[idx], start: val };
                              return { ...prev, experience: next };
                            });
                          }}
                        />
                        <Input
                          value={job.end}
                          placeholder="End"
                          onChange={(e) => {
                            const val = e.target.value;
                            setDraft((prev) => {
                              const next = [...prev.experience];
                              next[idx] = { ...next[idx], end: val };
                              return { ...prev, experience: next };
                            });
                          }}
                        />
                      </div>
                      <Textarea
                        rows={3}
                        value={job.bullets.join("\n")}
                        placeholder="Bullets (one per line)"
                        onChange={(e) => {
                          const bullets = e.target.value
                            .split("\n")
                            .filter((l) => l.trim().length > 0);
                          setDraft((prev) => {
                            const next = [...prev.experience];
                            next[idx] = { ...next[idx], bullets };
                            return { ...prev, experience: next };
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* 5. PUBLICATIONS */}
              {section === "publications" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">
                      Publications ({draft.publications.length})
                    </h3>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          publications: [
                            {
                              title: "New Paper Title",
                              authors: "Lawal, A.",
                              venue: "Journal / Conference",
                              year: "2025",
                              link: "",
                            },
                            ...prev.publications,
                          ],
                        }))
                      }
                    >
                      <Plus className="h-4 w-4" />
                      Add Paper
                    </Button>
                  </div>

                  {draft.publications.map((pub, idx) => (
                    <div
                      key={idx}
                      className="space-y-2 rounded-xl border border-border bg-card p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Paper #{idx + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setDraft((prev) => ({
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
                      <Input
                        value={pub.title}
                        placeholder="Title"
                        onChange={(e) => {
                          const val = e.target.value;
                          setDraft((prev) => {
                            const next = [...prev.publications];
                            next[idx] = { ...next[idx], title: val };
                            return { ...prev, publications: next };
                          });
                        }}
                      />
                      <Input
                        value={pub.authors}
                        placeholder="Authors"
                        onChange={(e) => {
                          const val = e.target.value;
                          setDraft((prev) => {
                            const next = [...prev.publications];
                            next[idx] = { ...next[idx], authors: val };
                            return { ...prev, publications: next };
                          });
                        }}
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          value={pub.venue}
                          placeholder="Venue"
                          className="col-span-2"
                          onChange={(e) => {
                            const val = e.target.value;
                            setDraft((prev) => {
                              const next = [...prev.publications];
                              next[idx] = { ...next[idx], venue: val };
                              return { ...prev, publications: next };
                            });
                          }}
                        />
                        <Input
                          value={pub.year}
                          placeholder="Year"
                          onChange={(e) => {
                            const val = e.target.value;
                            setDraft((prev) => {
                              const next = [...prev.publications];
                              next[idx] = { ...next[idx], year: val };
                              return { ...prev, publications: next };
                            });
                          }}
                        />
                      </div>
                      <Input
                        value={pub.link ?? ""}
                        placeholder="Paper URL (optional)"
                        onChange={(e) => {
                          const val = e.target.value;
                          setDraft((prev) => {
                            const next = [...prev.publications];
                            next[idx] = { ...next[idx], link: val };
                            return { ...prev, publications: next };
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* 6. CV & SOCIAL LINKS */}
              {section === "cv" && (
                <div className="space-y-5">
                  <div className="space-y-3 rounded-xl border border-border bg-card p-4">
                    <h3 className="font-semibold">Curriculum Vitae (PDF)</h3>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90">
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
                              void handleUpload(
                                f,
                                "cv",
                                "cv",
                                (_url, downloadUrl) => {
                                  setDraft((prev) => ({
                                    ...prev,
                                    about: {
                                      ...prev.about,
                                      cvUrl: downloadUrl,
                                    },
                                  }));
                                }
                              );
                            }
                          }}
                        />
                      </label>
                      <a
                        href={draft.about.cvUrl || "/documents/cv.pdf"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        View Current CV →
                      </a>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-xl border border-border bg-card p-4">
                    <h3 className="font-semibold">Contact &amp; Social URLs</h3>
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Email</label>
                      <Input
                        value={draft.socials.email}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDraft((prev) => ({
                            ...prev,
                            about: { ...prev.about, email: val },
                            socials: { ...prev.socials, email: val },
                          }));
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Phone</label>
                      <Input
                        value={draft.socials.phone}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDraft((prev) => ({
                            ...prev,
                            about: { ...prev.about, phone: val },
                            socials: { ...prev.socials, phone: val },
                          }));
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium">LinkedIn URL</label>
                      <Input
                        value={draft.socials.linkedin}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            socials: {
                              ...prev.socials,
                              linkedin: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium">GitHub URL</label>
                      <Input
                        value={draft.socials.github}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            socials: {
                              ...prev.socials,
                              github: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 7. INBOX */}
              {section === "inbox" && (
                <div className="space-y-4">
                  <h3 className="font-semibold">
                    Contact Messages ({draft.messages?.length ?? 0})
                  </h3>
                  {!draft.messages || draft.messages.length === 0 ? (
                    <p className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
                      No messages yet.
                    </p>
                  ) : (
                    draft.messages.map((m) => (
                      <div
                        key={m.id}
                        className="space-y-2 rounded-xl border border-border bg-card p-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">{m.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(m.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <a
                          href={`mailto:${m.email}`}
                          className="text-xs text-primary hover:underline"
                        >
                          {m.email}
                        </a>
                        <p className="text-sm text-foreground">{m.message}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* 8. CHANGE PASSWORD */}
              {section === "password" && (
                <form
                  onSubmit={handlePasswordChange}
                  className="space-y-4 rounded-xl border border-border bg-card p-5"
                >
                  <div>
                    <h3 className="font-semibold">Change Admin Password</h3>
                    <p className="text-xs text-muted-foreground">
                      Once changed, your new password is encrypted and saved to
                      storage so only you can unlock Admin Mode.
                    </p>
                  </div>
                  <Input
                    type="password"
                    placeholder="Current password"
                    value={currPass}
                    onChange={(e) => setCurrPass(e.target.value)}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="New password (min 6 characters)"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    minLength={6}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={confPass}
                    onChange={(e) => setConfPass(e.target.value)}
                    minLength={6}
                    required
                  />
                  <Button type="submit" className="w-full">
                    Update Admin Password
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
