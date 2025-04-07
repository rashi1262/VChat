import { auth, provider, signInWithPopup, signOut } from "../firebaseConfig";

export const signInWithGoogle = async () => {
  if (typeof window === "undefined") return null; // Prevent SSR execution

  let userCredits = 20;
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const checkUserResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/user-by-email?email=${encodeURIComponent(user.email)}`
    );

    let userId;
    if (!checkUserResponse.ok) {
      const signupResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/create-user`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: user.displayName,
            email: user.email,
            image: user.photoURL,
            googleLogin: true,
            credits: 20,
          }),
        }
      );

      if (!signupResponse.ok) return null;

      const signupData = await signupResponse.json();
      userId = signupData.id;
    } else {
      const { user: existingUser } = await checkUserResponse.json();
      userId = existingUser.id;

      if (!existingUser.googleLogin) {
        return {
          error: "Your account is not linked with Google. Please sign in using your original method.",
        };
      }
    }

    const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, googleLogin: true }),
    });

    const res = await loginResponse.json();
    userCredits = res.credits;

    localStorage.setItem(
      "user",
      JSON.stringify({
        id: userId,
        email: user.email,
        name: user.displayName,
        image: user.photoURL,
        credits: userCredits,
      })
    );
    localStorage.setItem("hasLoggedIn", true);

    return user;
  } catch (error) {
    console.error("Google Sign In Error: ", error);  // helpful for debugging
    return null;
  }
};

export const logout = async () => {
  await signOut(auth);
  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
  }
};
