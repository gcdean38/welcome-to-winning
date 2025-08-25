import NextAuth from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hour
  },
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID,
      clientSecret: process.env.COGNITO_CLIENT_SECRET,
      issuer: process.env.COGNITO_ISSUER,
      authorization: {
        params: {
          prompt: "login",
          scope: "openid email profile",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const command = new GetItemCommand({
        TableName: "AllowedUsers",
        Key: { email: { S: user.email } },
      });

      try {
        const result = await client.send(command);
        console.log("DynamoDB result:", JSON.stringify(result, null, 2)); // 👈 log what we actually get

        if (!result.Item) return false;

        user.role = result.Item.role?.S || "client";
        user.firstName =
          result.Item.firstName?.S || user.name?.split(" ")[0] || "";
        user.orgId = result.Item.orgId?.S || null; // ✅ capture orgId

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
        token.orgId = user.orgId || null; // ✅ persist orgId
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.firstName = token.firstName;
        session.user.orgId = token.orgId || null; // ✅ attach orgId to session
      }
      return session;
    },

    async redirect({ baseUrl, token }) {
      if (token?.role === "admin") return `${baseUrl}/admin`;
      if (token?.role === "client") return `${baseUrl}/client`;
      return baseUrl;
    },
  },
});

export { handler as GET, handler as POST };
