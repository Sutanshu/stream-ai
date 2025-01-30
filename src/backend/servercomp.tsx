"use server";
import ollama from "ollama";
import react from "react";

export const fetchDataFromOlama = async (
  prevState: any,
  formData: FormData
) => {
  "use server";
  "use dynamic";
  const inputData = formData.get("inputData") as string;

  if (!inputData) {
    return { error: "Input cannot be empty!" };
  }

  const resp = await ollama.generate({
    model: "llama3.2",
    prompt: inputData,
  });
  return { message: resp.response };
};

export default async function ServerComp(prompt: string) {
  const fetchData = async () => {
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
      <p>{await fetchData()}</p>
    </div>
  );
}
