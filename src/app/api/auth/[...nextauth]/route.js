import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: { params: { prompt: "consent", access_type: "offline", response_type: "code" } },

    }),
  ],

  callbacks: {
    async signIn({ user }) {
      try {
        const checkUserResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/user-by-email?email=${encodeURIComponent(user.email)}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        let userId;

        if (!checkUserResponse.ok) {
    

          const signupResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/create-user`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: user.name,
                email: user.email,
                image: user.image,
                googleLogin: true,
                credits: 20,
              }),
            }
          );

          if (!signupResponse.ok) {
      
            return false;
          }

          const signupData = await signupResponse.json();
          userId = signupData.id;
 
        } else {

          const { user: existingUser, status } = await checkUserResponse.json();
          
          if (status === "success" && existingUser) {
            userId = existingUser.id;

            if (typeof window !== "undefined") {
              localStorage.setItem("user", JSON.stringify(existingUser));
              localStorage.setItem("remainingCredits", JSON.stringify(existingUser.credits));
            }

          

            const loginResponse = await fetch(
              `${process.env.NEXT_PUBLIC_BASE_URL}/login`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: user.email, googleLogin: true }),
              }
            );

            if (!loginResponse.ok) {
          
              return false;
            }

            const loginData = await loginResponse.json();
  
          }
        }

        user.id = userId;
        return true;
      } catch (error) {
     
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      return session;
    },
  },
  debug: true,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
