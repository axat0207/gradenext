// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { supabase } from "@/lib/supabase";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          // Sign in with Supabase
          const {
            data: { user },
            error,
          } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error) {
            console.error("Supabase auth error:", error);
            return null;
          }

          if (!user) {
            return null;
          }

          // Get additional user data from your users table
          const { data: profile, error: profileError } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profileError) {
            console.error("Profile fetch error:", profileError);
          }

          // Return the user object
          return {
            id: user.id,
            email: user.email,
            name: profile?.student_name,
            student_name: profile?.student_name,
            parent_name: profile?.parent_name,
            guardian_type: profile?.guardian_type,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.student_name = user.student_name;
        token.parent_name = user.parent_name;
        token.guardian_type = user.guardian_type;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.student_name = token.student_name as string;
        session.user.parent_name = token.parent_name as string;
        session.user.guardian_type = token.guardian_type as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    signUp: "/auth/signup",
  },
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
};
//@ts-ignore
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
