import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import {
  createSingleActiveSession,
  isSingleSessionValid,
  SESSION_IDLE_TIMEOUT_SECONDS,
  touchSingleSession,
} from "@/lib/auth/single-session";

type AuthUserWithRole = {
  role?: string | null;
};

type AuthTokenWithRole = {
  sub?: string;
  role?: string | null;
  singleSessionToken?: string | null;
  singleSessionInvalid?: boolean;
};

type SessionUserWithRole = {
  id?: string;
  role?: string | null;
};

type SessionWithError = {
  error?: "SESSION_REVOKED";
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
    maxAge: SESSION_IDLE_TIMEOUT_SECONDS,
    updateAge: 5 * 60,
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          throw new Error("User not found");
        }

        const valid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!valid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const authUser = user as AuthUserWithRole;
        const authToken = token as AuthTokenWithRole;
        const singleSession = await createSingleActiveSession({
          id: user.id,
          role: authUser.role,
        });

        authToken.role = authUser.role;
        authToken.singleSessionToken = singleSession.sessionToken;
        authToken.singleSessionInvalid = false;
        return authToken;
      }

      const authToken = token as AuthTokenWithRole;

      if (authToken.singleSessionToken) {
        const isValid = await isSingleSessionValid(authToken.singleSessionToken);

        if (!isValid) {
          authToken.singleSessionInvalid = true;
          return authToken;
        }

        authToken.singleSessionInvalid = false;
        await touchSingleSession(authToken.singleSessionToken);
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        const sessionUser = session.user as SessionUserWithRole;
        const authToken = token as AuthTokenWithRole;

        if (authToken.singleSessionInvalid) {
          delete session.user;
          (session as SessionWithError).error = "SESSION_REVOKED";
          return session;
        }

        sessionUser.id = authToken.sub;
        sessionUser.role = authToken.role;
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
