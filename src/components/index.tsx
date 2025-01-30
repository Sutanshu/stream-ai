"use client";
import react, { useActionState } from "react";

export default function Form({
  action,
}: {
  action: (prevState: any, formData: FormData) => Promise<any>;
}) {
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction}>
      <input type="text" name="inputData" />
      <button type="submit">Submit</button>

      {isPending && <p>Loading...</p>}
      {state?.error && <p style={{ color: "red" }}>{state.error}</p>}

      {state?.message && <p style={{ color: "green" }}>{state.message}</p>}
    </form>
  );
}
