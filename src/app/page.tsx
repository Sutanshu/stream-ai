import Form from "@/components";
import React, { Suspense } from "react";

export default function Home() {
  return (
    <div>
      <h1>Meet my own ChatGPT!</h1>
      <Suspense fallback={<p>Loading form...</p>}>
        <Form />
      </Suspense>
    </div>
  );
}
