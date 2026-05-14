import { headers } from "next/headers";

// Must be async — headers() is a Promise in Next.js 15
export async function getCurrentUser() {
  const headersList = await headers();
  const userId = headersList.get("x-user-id");
  const userEmail = headersList.get("x-user-email");

  if (!userId) return null;

  return {
    id: userId,
    email: userEmail ?? "",
  };
}