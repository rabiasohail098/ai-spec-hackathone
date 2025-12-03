import { createAuthClient, getCurrentSession } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001", // Should match your backend server URL
  fetchOptions: {
    // Additional fetch options if needed
  }
});

export const { signIn, signUp, signOut, useSession } = authClient;