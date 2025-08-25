"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ClientPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
    if (status === "authenticated" && session.user?.role !== "client") {
      router.push("/"); // 🚫 kick non-clients
    }
  }, [status, session, router]);

  if (status === "loading") return <p>Loading...</p>;
  if (!session || session.user?.role !== "client") return null;

  return (
    <div style={{ padding: "2rem",color: "var(--dark-carolina)" }}>
      <h1>Client Dashboard</h1>
      <p>Welcome, {session.user?.email}</p>
      <p>Role: {session.user?.role}</p>
      <p>Org: {session.user?.orgId || "N/A"}</p>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        style={{
          marginTop: "1rem",
          background: "#4B9CD3",
          color: "white",
          border: "none",
          padding: "0.5rem 1rem",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Sign out
      </button>
    </div>
  );
}
