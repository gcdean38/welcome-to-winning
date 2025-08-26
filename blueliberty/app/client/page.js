"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

/** 🔹 Reusable Drag-and-Drop Zone */
function FileDropZone({ onFileSelect }) {
  const [dragging, setDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        border: "2px dashed var(--dark-carolina)",
        borderRadius: "12px",
        padding: "2rem",
        textAlign: "center",
        background: dragging ? "#f0f8ff" : "#fafafa",
        cursor: "pointer",
        marginTop: "0.5rem",
      }}
    >
      <p>{dragging ? "Release to upload" : "Drag & drop a file here"}</p>
      <p>or</p>
      <input type="file" onChange={(e) => onFileSelect(e.target.files[0])} />
    </div>
  );
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [allFiles, setAllFiles] = useState({});
  const [newFiles, setNewFiles] = useState([]);
  const [file, setFile] = useState(null);
  const [selectedOrg, setSelectedOrg] = useState("");

  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchAll = async () => {
      try {
        const res = await fetch("/api/s3/listAll", { method: "POST" });
        if (!res.ok) return;

        const data = await res.json();
        setAllFiles(data);

        // Detect recent files (last 24h)
        const now = new Date();
        const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const recent = [];

        Object.entries(data).forEach(([orgId, dirs]) => {
          ["inbound", "outbound"].forEach((dir) => {
            dirs[dir]?.forEach((f) => {
              if (new Date(f.lastModified) > cutoff) {
                recent.push({ orgId, orgName: dirs.orgName, dir, name: f.name });
              }
            });
          });
        });

        setNewFiles(recent);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAll();
  }, [status]);

  const handleUpload = async () => {
    if (!file || !selectedOrg) {
      alert("Please select an org and a file");
      return;
    }

    try {
      const res = await fetch("/api/s3/upload", {
        method: "POST",
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          targetOrgId: selectedOrg,
        }),
        headers: { "Content-Type": "application/json" },
      });
      const { url } = await res.json();

      await fetch(url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });

      alert(`File uploaded to ${selectedOrg}/inbound ✅`);
      setFile(null);
      setSelectedOrg("");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  const downloadFile = async (f) => {
    try {
      const res = await fetch(f.url, { method: "GET" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const arrayBuffer = await res.arrayBuffer();
      const blob = new Blob([arrayBuffer], {
        type: res.headers.get("Content-Type") || "application/octet-stream",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = f.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Download failed. Please try again.");
    }
  };

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return null;

  return (
    <div style={{ padding: "2rem", color: "var(--dark-carolina)" }}>
      <h1>Blue Liberty Admin Dashboard</h1>
      <p>Role: {session.user?.role}</p>

      {/* New files alert */}
      {newFiles.length > 0 && (
        <div
          style={{
            background: "#fffae6",
            border: "1px solid #ffe58f",
            padding: "1rem",
            marginBottom: "2rem",
            borderRadius: "12px",
          }}
        >
          <strong>🔔 {newFiles.length} new file(s)</strong>
          <ul>
            {newFiles.map((f, i) => (
              <li key={i}>
                {f.orgName || f.orgId} → {f.dir}: <em>{f.name}</em>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Upload section */}
      <div style={{ marginBottom: "2rem" }}>
        <h2>Upload File to Campaign</h2>
        <select value={selectedOrg} onChange={(e) => setSelectedOrg(e.target.value)}>
          <option value="">Select campaign...</option>
          {Object.entries(allFiles).map(([orgId, dirs]) => (
            <option key={orgId} value={orgId}>
              {dirs.orgName || orgId}
            </option>
          ))}
        </select>

        <FileDropZone onFileSelect={(f) => setFile(f)} />

        <button
          onClick={handleUpload}
          disabled={!file || !selectedOrg}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            background: "var(--dark-carolina)",
            color: "#fff",
            border: "none",
            cursor: file && selectedOrg ? "pointer" : "not-allowed",
          }}
        >
          Upload
        </button>
      </div>

      {/* Accordion per org */}
      {Object.entries(allFiles).map(([orgId, dirs]) => (
        <details
          key={orgId}
          style={{
            marginBottom: "1rem",
            border: "1px solid #eee",
            borderRadius: "12px",
            padding: "0.5rem",
          }}
        >
          <summary style={{ fontWeight: "600", cursor: "pointer", padding: "0.5rem 0" }}>
            {dirs.orgName || orgId}
          </summary>

          {["inbound", "outbound"].map((dir) => (
            <div key={dir} style={{ marginTop: "1rem" }}>
              <h3>{dir === "inbound" ? "Sent" : "Inbox"}</h3>
              {dirs[dir]?.length === 0 ? (
                <p>No {dir} files</p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  {dirs[dir]
  .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
  .map((f) => {
    const dateStr = f.lastModified
      ? new Date(f.lastModified).toISOString().split("T")[0]
      : "";
    return (
      <a
        key={f.name}
        href={f.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "1rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            display: "flex",
            flexDirection: "column",
            cursor: "pointer",
            transition: "transform 0.1s ease-in-out",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{ fontWeight: 600, wordBreak: "break-word" }}
            >
              {f.name}
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                window.open(f.url, "_blank");
              }}
              title="Download file"
              style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer" }}
            >
              ⬇️
            </button>
          </div>
          {dateStr && (
            <span
              style={{
                fontSize: "0.85rem",
                fontStyle: "italic",
                color: "#444",
                marginTop: "0.4rem",
              }}
            >
              Date uploaded: {dateStr}
            </span>
          )}
        </div>
      </a>
    );
  })}

                </div>
              )}
            </div>
          ))}
        </details>
      ))}
    </div>
  );
}
