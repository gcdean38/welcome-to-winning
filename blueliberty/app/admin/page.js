"use client";

import { useSession, signOut } from "next-auth/react";

export default function AdminPage() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return null; // middleware ensures only admins reach here

  return (
    <div style={{ padding: "2rem", color: "var(--dark-carolina)" }}>
      <h1>{session.user?.orgId || "N/A"}&apos;s Dashboard</h1>
      <p>Role: {session.user?.role}</p>
      <p>Org: {session.user?.orgId || "N/A"}</p>

      {/* <button
        onClick={() => signOut({ callbackUrl: "/" })}
        style={{
          marginTop: "1rem",
          background: "#4B9CD3",
          color: "white",
          border: "none",
          padding: "0.5rem 1rem",
          borderRadius: "9999px", // pill style
          cursor: "pointer",
        }}
      >
        Sign out
      </button> */}
    </div>
  );
}
