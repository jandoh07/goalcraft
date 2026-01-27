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
  signIn: (email: string, password: string) => Promise<UserCredential>,
  redirectTo: string = "/goals"
) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    // signIn now includes session cookie creation (awaited inside auth context)
    await signIn(email, password);
    // Use full page redirect to ensure proxy processes the new session
    // The signIn function awaits createSession, so cookie should be set by now
    window.location.replace(redirectTo);
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
  signInWithGoogle: () => Promise<UserCredential>,
  redirectTo: string = "/goals"
) => {
  setError("");
  setGoogleLoading(true);

  try {
    // signInWithGoogle now includes session cookie creation (awaited inside auth context)
    await signInWithGoogle();
    // Use full page redirect to ensure proxy processes the new session
    // The signInWithGoogle function awaits createSession, so cookie should be set by now
    window.location.replace(redirectTo);
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
