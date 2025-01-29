"use server";
import ollama from "ollama";
import react from "react";

export default async function ServerComp() {
  const fetchData = async (prompt: any) => {
    const data = await ollama.generate({
      model: "llama3.2",
      prompt: prompt,
    });
    return data.response;
  };
  return (
    <div>
      <h2>Server Component</h2>
      <p>Fetching data from localhost:11343</p>
      <p>{await fetchData("How does this work?")}</p>
    </div>
  );
}
