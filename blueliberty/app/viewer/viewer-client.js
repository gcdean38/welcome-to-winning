"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ViewerClient() {
  const searchParams = useSearchParams();
  const fileUrl = searchParams.get("file");
  const [html, setHtml] = useState(null);

  useEffect(() => {
    if (!fileUrl) return;

    const fetchHtml = async () => {
      try {
        const res = await fetch(fileUrl);
        if (!res.ok) throw new Error("Failed to fetch file");
        const text = await res.text();

        // inject print script
        const injected = text.replace(
          "</body>",
          `<script>window.onload = () => setTimeout(() => window.print(), 500);</script></body>`
        );
        setHtml(injected);
      } catch (err) {
        console.error("Viewer failed:", err);
        setHtml("<h1>Failed to load file</h1>");
      }
    };

    fetchHtml();
  }, [fileUrl]);

  if (!fileUrl) return <p>No file specified</p>;
  if (!html) return <p>Loading...</p>;

  return (
    <iframe
      srcDoc={html}
      style={{ width: "100vw", height: "100vh", border: "none" }}
    />
  );
}
