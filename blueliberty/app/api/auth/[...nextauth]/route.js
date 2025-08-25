import NextAuth from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",      // ✅ Use JWT sessions
    maxAge: 60 * 60,      // ✅ 1 hour session
  },
  providers: [
CognitoProvider({
  clientId: process.env.COGNITO_CLIENT_ID,
  clientSecret: process.env.COGNITO_CLIENT_SECRET,
  issuer: process.env.COGNITO_ISSUER,
  authorization: {
    params: {
      prompt: "login",     // ✅ forces credentials prompt every time
      scope: "openid email profile", // ✅ make sure scope is correct
    },
  },
}),
    
  ],
  callbacks: {
    async signIn({ user }) {
      // ✅ Pull role + firstName from DynamoDB
      const command = new GetItemCommand({
        TableName: "AllowedUsers",
        Key: { email: { S: user.email } },
      });

      try {
        const result = await client.send(command);
        if (!result.Item) return false; // 🚫 reject if not found

        user.role = result.Item.role?.S || "client";
        user.firstName = result.Item.firstName?.S || user.name?.split(" ")[0] || "";
        return true;
      } catch (err) {
        console.error("DynamoDB error:", err);
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.role = user.role || "client";
        token.firstName = user.firstName || "";
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.firstName = token.firstName;
      }
      return session;
    },

    async redirect({ baseUrl, token }) {
      // ✅ Role-based redirects after login
      if (token?.role === "admin") return `${baseUrl}/admin`;
      if (token?.role === "client") return `${baseUrl}/client`;
      return baseUrl;
    },
  },
});

export { handler as GET, handler as POST };
