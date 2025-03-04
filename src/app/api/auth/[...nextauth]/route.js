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
          console.log("User does not exist, creating new account...");

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
              }),
            }
          );
         
          
          if (!signupResponse.ok) {
            console.error("Signup failed:", signupResponse.statusText);
            return false;
          }
          const signupData = await signupResponse.json();
console.log("Signup API Response:", signupData);

userId = signupData.id; 
console.log("Extracted User ID:", userId);
        }

        const data = await checkUserResponse.json();
        if (data.exists) {
          const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user.email,  googleLogin: true, }),
          });

          if (!loginResponse.ok) {
            console.error("Login failed:", loginResponse.statusText);
            return false;
          }
          userId = loginResponse.id;
        } else {
         
        }
        user.id = userId
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ; 
        console.log(user.id);
        
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      console.log("Session Callback - User ID:", session.user.id);
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };




