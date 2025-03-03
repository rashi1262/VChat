import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: { prompt: "select_account" },
      },
    }),

    

  ],
  callbacks: {
    async signIn({ user }) {
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
          localStorage.setItem("user", JSON.stringify(user));
        }
      }

      return true;
    },
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : `${baseUrl}/model`;
    },
    async session({ session }) {
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(session.user));
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
      
      
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };



