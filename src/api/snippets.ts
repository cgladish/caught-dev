import axios from "axios";

const API_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8000"
    : "https://api.preserve.dev";

export type ExternalSnippet = {
  id: string;
  // Fill out more fields as needed....
};
export type ExternalApp = {
  id: string;
  name: string;
};
type SnippetMessageInput = {
  content: string;
  sentAt: Date;
  attachments?: {
    type: string;
    url?: string;
    width?: number;
    height?: number;
    size?: number;
  }[];
  authorUsername: string;
  authorIdentifier?: string;
  authorAvatarUrl?: string;
};
type SnippetInput = {
  appId: string;
  messages: SnippetMessageInput[];
};
export const createSnippet = async (
  appName: AppName,
  messages: SnippetMessageInput[]
): Promise<string> => {
  const appsResponse = await axios.get<ExternalApp[]>(`${API_URL}/apps`);
  const apps = appsResponse.data;

  const app = apps.find(
    (app) => app.name.toLowerCase() === appName.toLowerCase()
  );
  if (!app) {
    throw new Error("Unable to find app");
  }

  const snippetInput: SnippetInput = {
    appId: app.id,
    messages,
  };
  const snippetResponse = await axios.post<ExternalSnippet>(
    `${API_URL}/snippets`,
    snippetInput,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return snippetResponse.data.id;
};
