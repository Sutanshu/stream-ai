import Form from "@/components";
import React, { Suspense } from "react";

export default function Home() {
  return (
    <div>
      <Suspense fallback={<p>Loading form...</p>}>
        <Form />
      </Suspense>
    </div>
  );
}
