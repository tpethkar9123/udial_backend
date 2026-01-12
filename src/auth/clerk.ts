import { createClerkClient, verifyToken } from '@clerk/backend';

export async function verifyJwt(token: string) {
  try {
    const verifiedToken = await verifyToken(token, {
      jwtKey: process.env.CLERK_JWT_KEY,
      // Allow from all authorized parties (azp)
    });
    if (!verifiedToken || !verifiedToken.sub) {
      return null;
    }
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    const user = await clerkClient.users.getUser(verifiedToken.sub);
    return { verifiedToken, user };
  } catch (error) {
    console.error('Clerk JWT verification failed:', error);
    return null;
  }
}
