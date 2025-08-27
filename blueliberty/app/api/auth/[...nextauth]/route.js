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

export const authOptions = {
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
          response_type: "code",
        },
      },
      checks: ["pkce", "state"],
      client: {
        token_endpoint_auth_method: "client_secret_post",
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
        console.log("DynamoDB result:", JSON.stringify(result, null, 2));

        if (!result.Item) return false;

        user.role = result.Item.role?.S || "client";
        user.firstName = result.Item.firstName?.S || user.name?.split(" ")[0] || "";
        user.orgId = result.Item.orgId?.S || null;
        user.orgName = result.Item.orgName?.S || null;

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
        token.orgId = user.orgId || null;
        token.orgName = user.orgName || null;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.firstName = token.firstName;
        session.user.orgId = token.orgId || null;
        session.user.orgName = token.orgName || null;
      }
      return session;
    },

    async redirect({ baseUrl, token }) {
      if (token?.role === "admin") return `${baseUrl}/admin`;
      if (token?.role === "client") return `${baseUrl}/client`;
      return baseUrl;
    },
  },
  events: {
    async signOut({ token, session }) {
      // Additional cleanup on sign out
      console.log("User signed out, clearing state");
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
