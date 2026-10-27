"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  House,
  LayoutDashboard,
  Building2,
  CalendarDays,
  Settings2,
  Menu,
  X,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import type { Realtor } from "@/lib/server/auth";
import { SignOutButton } from "@/components/editor/sign-out-button";
import { Button } from "@/components/ui/button";
function Brand() {
  return (
    <Link className="brand" href="/dashboard">
      <span className="brand-mark">
        <House size={24} aria-hidden="true" />
      </span>
      <span>
        OpenHouse <span className="brand-ai">AI</span>
      </span>
    </Link>
  );
}
function Profile({ user }: { user: Realtor | null }) {
  return (
    <div className="profile">
      <span className="avatar" aria-hidden="true">
        {user?.name
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("") || "?"}
      </span>
      <div>
        <strong>{user?.name || "Realtor"}</strong>
        <span>{user?.email}</span>
      </div>
    </div>
  );
}
function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Workspace">
      <Link
        className={`nav-item ${pathname === "/dashboard" ? "active" : ""}`}
        href="/dashboard"
        aria-current={pathname === "/dashboard" ? "page" : undefined}
        onClick={onNavigate}
      >
        <LayoutDashboard size={19} aria-hidden="true" />
        Dashboard
      </Link>
      <Link
        className={`nav-item ${pathname.startsWith("/properties") ? "active" : ""}`}
        href="/properties"
        aria-current={pathname === "/properties" ? "page" : undefined}
        onClick={onNavigate}
      >
        <Building2 size={19} aria-hidden="true" />
        My Properties
      </Link>
      {[
        { label: "Open Houses", icon: CalendarDays },
        { label: "Settings", icon: Settings2 },
      ].map(({ label, icon: Icon }) => (
        <div className="nav-item upcoming" key={label}>
          <Icon size={19} aria-hidden="true" />
          {label}
          <span className="soon">Soon</span>
        </div>
      ))}
    </nav>
  );
}
export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: Realtor | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    const expired = () => {
      router.replace("/login");
      router.refresh();
    };
    window.addEventListener("openhouse:unauthorized", expired);
    return () => window.removeEventListener("openhouse:unauthorized", expired);
  }, [router]);
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const menuButton = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!open) return;
    const element = dialog.current;
    const trigger = menuButton.current?.querySelector("button");
    element?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = previous;
      trigger?.focus();
    };
  }, [open]);
  if (pathname === "/login") return <>{children}</>;
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="mobile-bar">
        <Brand />
        <span ref={menuButton}>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open navigation"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen(true)}
          >
            <Menu aria-hidden="true" />
          </Button>
        </span>
      </header>
      <aside className="sidebar" aria-label="Main navigation">
        <Brand />
        <div className="workspace-label">YOUR WORKSPACE</div>
        <Navigation />
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <Sparkles size={19} aria-hidden="true" />
            <strong>Great homes.<br />Greater possibilities.</strong>
            <p>Make your next first impression exceptional.</p>
            <Link href="/properties/new">Create a property <ArrowUpRight size={14} aria-hidden="true" /></Link>
          </div>
          <Profile user={user} />
        </div>
      </aside>
      <dialog
        className="drawer"
        id="mobile-navigation"
        ref={dialog}
        aria-label="Workspace navigation"
        onCancel={() => setOpen(false)}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            const r = event.currentTarget.getBoundingClientRect();
            if (event.clientX < r.left || event.clientX > r.right)
              setOpen(false);
          }
        }}
      >
        <div className="drawer-inner">
          <div className="drawer-heading">
            <strong>Workspace</strong>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close navigation"
              onClick={() => setOpen(false)}
            >
              <X aria-hidden="true" />
            </Button>
          </div>
          <Navigation onNavigate={() => setOpen(false)} />
          <Profile user={user} />
          <SignOutButton />
        </div>
      </dialog>
      <div className="main-wrap">
        <div className="topbar">
          <span>
            Workspace<span className="breadcrumb-slash">/</span>
            <strong>
              {pathname === "/dashboard"
                ? "Dashboard"
                : pathname === "/properties"
                  ? "My Properties"
                  : pathname === "/properties/new"
                    ? "Add property"
                    : "Property profile"}
            </strong>
          </span>
          <div className="topbar-actions"><span className="workspace-pill"><span /> Private workspace</span><SignOutButton /></div>
        </div>
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <footer className="footer">
          <span>OpenHouse AI <span className="footer-dot">/</span> A new perspective on property</span>
          <span className="footer-security"><ShieldCheck size={12} aria-hidden="true" /> Private workspace · CAD pricing</span>
        </footer>
      </div>
    </div>
  );
}
