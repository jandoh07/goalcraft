import { FirebaseError } from "firebase/app";
import { UserCredential } from "firebase/auth";

const getErrorMessage = (error: FirebaseError) => {
  switch (error.code) {
    case "auth/invalid-email":
      return "Invalid email address.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/wrong-password":
      return "Incorrect password.";
    case "auth/invalid-credential":
      return "Invalid email or password.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    default:
      return "An error occurred. Please try again.";
  }
};

export const handleEmailLogin = async (
  e: React.FormEvent,
  email: string,
  password: string,
  setError: React.Dispatch<React.SetStateAction<string>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  signIn: (email: string, password: string) => Promise<UserCredential>
) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    await signIn(email, password);
    // Don't navigate immediately - let the auth state change handle it
    // The useEffect above will redirect when user is authenticated
  } catch (err) {
    if (err instanceof FirebaseError) {
      setError(getErrorMessage(err));
    } else {
      setError("An unexpected error occurred.");
    }
    setLoading(false); // Only reset loading on error
  }
};

export const handleGoogleLogin = async (
  setError: React.Dispatch<React.SetStateAction<string>>,
  setGoogleLoading: React.Dispatch<React.SetStateAction<boolean>>,
  signInWithGoogle: () => Promise<UserCredential>
) => {
  setError("");
  setGoogleLoading(true);

  try {
    await signInWithGoogle();
    // Don't navigate immediately - let the auth state change handle it
    // The useEffect above will redirect when user is authenticated
  } catch (err) {
    if (err instanceof FirebaseError) {
      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in cancelled.");
      } else {
        setError(getErrorMessage(err));
      }
    } else {
      setError("An unexpected error occurred.");
    }
    setGoogleLoading(false); // Only reset loading on error
  }
};
