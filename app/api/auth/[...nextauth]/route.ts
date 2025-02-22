// app/api/auth/[...nextauth]/route.ts
import NextAuth, { PagesOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from "@/lib/supabase";
interface CustomPagesOptions extends Partial<PagesOptions> {
  signUp?: string; // Add signUp property
}
const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const {
          data: { user },
          error,
        } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error) return null;
        return user;
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    signUp: "/auth/signup",
  } as CustomPagesOptions,
  callbacks: {
    async session({ session, token }) {
      if (token) {
        //@ts-ignore
        session.user.id = token.sub!;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
