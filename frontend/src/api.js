import { supabase } from "./supabaseClient";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

async function request(path, { method = "GET", body, form } = {}) {
  const { data: auth } = await supabase.auth.getSession();
  const token = auth.session?.access_token;
  if (!token) throw new Error("Please sign in.");

  const headers = { Authorization: `Bearer ${token}` };
  let payload;
  if (form) {
    payload = form;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${API_URL}/api${path}`, { method, headers, body: payload });
  } catch {
    throw new Error("Cannot reach the server. Check your connection and try again.");
  }

  if (response.status === 401) {
    await supabase.auth.signOut({ scope: "local" });
    throw new Error("Your session expired. Please sign in again.");
  }
  if (response.status === 204) return null;

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      typeof result.detail === "string" ? result.detail : "Please check what you entered and try again."
    );
  }
  return result;
}

export const api = {
  me: () => request("/me"),
  getProfile: () => request("/me/profile"),
  saveProfile: (instructions) => request("/me/profile", { method: "PUT", body: { instructions } }),
  listChats: () => request("/chats"),
  createChat: () => request("/chats", { method: "POST" }),
  getChat: (id) => request(`/chats/${id}`),
  updateChat: (id, changes) => request(`/chats/${id}`, { method: "PATCH", body: changes }),
  deleteChat: (id) => request(`/chats/${id}`, { method: "DELETE" }),
  sendMessage: (id, content, fileName) =>
    request(`/chats/${id}/messages`, { method: "POST", body: { content, file_name: fileName || null } }),
  uploadFile: (id, file) => {
    const form = new FormData();
    form.append("file", file);
    return request(`/chats/${id}/files`, { method: "POST", form });
  },
};
