"use client";

import { Suspense } from "react";
import ViewerClient from "./viewer-client";

export default function ViewerPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ViewerClient />
    </Suspense>
  );
}
