"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function ClientPage() {
  const { data: session, status } = useSession();
  const [file, setFile] = useState(null);
  const [outboundFiles, setOutboundFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(true);

  // ✅ Always call hooks unconditionally
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch("/api/s3/list", { method: "POST" });

        if (!res.ok) {
          console.error("Failed to fetch files:", res.status);
          setOutboundFiles([]);
          return;
        }

        const text = await res.text();
        if (!text) {
          setOutboundFiles([]);
          return;
        }

        const data = JSON.parse(text);
        setOutboundFiles(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching files:", err);
        setOutboundFiles([]);
      } finally {
        setLoadingFiles(false);
      }
    };

    if (session?.user?.orgId) {
      fetchFiles();
    }
  }, [session?.user?.orgId]);

  // ✅ Handle conditional rendering *after* hooks
  if (status === "loading") return <p>Loading...</p>;
  if (!session) return <p>Not signed in</p>;

  return (
    <div style={{ padding: "2rem", color: "var(--dark-carolina)" }}>
      <h1>{session.user?.orgName || "N/A"}&apos;s Dashboard</h1>
      <p>Role: {session.user?.role}</p>
      <p>Org: {session.user?.orgId || "N/A"}</p>

      {/* Upload section */}
      <div style={{ marginTop: "2rem" }}>
        <h2>Upload Files</h2>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={() => handleUpload(file)}>Upload</button>
      </div>

      {/* Outbound files */}
      <div style={{ marginTop: "2rem" }}>
        <h2>Files From Blue Liberty</h2>
        {loadingFiles ? (
          <p>Loading files...</p>
        ) : outboundFiles.length === 0 ? (
          <p>No files available.</p>
        ) : (
          <ul>
            {outboundFiles.map((f) => (
              <li key={f.name}>
                <a href={f.url} download>{f.name}</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

async function handleUpload(file) {
  if (!file) return;

  const res = await fetch("/api/s3/upload", {
    method: "POST",
    body: JSON.stringify({ fileName: file.name, fileType: file.type }),
    headers: { "Content-Type": "application/json" },
  });

  const { url } = await res.json();

  await fetch(url, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  alert("File uploaded!");
}
