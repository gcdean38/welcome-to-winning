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
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID,
      clientSecret: process.env.COGNITO_CLIENT_SECRET,
      issuer: process.env.COGNITO_ISSUER,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        const command = new GetItemCommand({
          TableName: "AllowedUsers",
          Key: { email: { S: user.email } },
        });

        const result = await client.send(command);

        if (!result.Item) {
          console.warn(`Unauthorized login attempt: ${user.email}`);
          return false;
        }

        // ✅ Attach attributes from DynamoDB
        user.role = result.Item.role?.S || "client";
        user.orgId = result.Item.orgId?.S || null;
        user.firstName = result.Item.firstName?.S || user.name?.split(" ")[0] || "User";

        return true;
      } catch (err) {
        console.error("DynamoDB error:", err);
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.role = user.role || "client";
        token.orgId = user.orgId || null;
        token.firstName = user.firstName || null;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.orgId = token.orgId;
        session.user.firstName = token.firstName;
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
