const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const uploadImage = async (
  file: File,
  scale: number,
): Promise<{ jobId: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("scale", String(scale));

  const res = await fetch(`${API_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Upload failed");
  }
  return res.json();
};
