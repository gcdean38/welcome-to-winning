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
  secret: process.env.NEXTAUTH_SECRET, // ✅ required in production!
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID,
      clientSecret: process.env.COGNITO_CLIENT_SECRET,
      issuer: process.env.COGNITO_ISSUER,
    }),
  ],
  callbacks: {
    // ✅ DynamoDB check disabled for now
    async signIn({ user }) {
      // Skip DB validation, allow all users to log in
      return true;

      // --- Keep this if you want to re-enable later ---
      /*
      const command = new GetItemCommand({
        TableName: "AllowedUsers",
        Key: { email: { S: user.email } },
      });

      try {
        const result = await client.send(command);
        if (!result.Item) return false;

        user.role = result.Item.role?.S || "user";
        user.orgId = result.Item.orgId?.S || null;
        return true;
      } catch (err) {
        console.error("DynamoDB error:", err);
        return false;
      }
      */
    },

    async jwt({ token, user }) {
      if (user) {
        token.role = user.role || "user";
        token.orgId = user.orgId || null;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.orgId = token.orgId;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
