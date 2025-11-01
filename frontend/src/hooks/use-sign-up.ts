import { FirebaseError } from "firebase/app";
import { UserCredential } from "firebase/auth";

const getErrorMessage = (error: FirebaseError) => {
  switch (error.code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/invalid-email":
      return "Invalid email address.";
    case "auth/operation-not-allowed":
      return "Email/password accounts are not enabled.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    default:
      return "An error occurred. Please try again.";
  }
};

const validatePassword = (
  password: string,
  confirmPassword: string,
  setError: React.Dispatch<React.SetStateAction<string>>
) => {
  if (password.length < 6) {
    setError("Password must be at least 6 characters long.");
    return false;
  }
  if (password !== confirmPassword) {
    setError("Passwords do not match.");
    return false;
  }
  return true;
};

export const handleEmailSignUp = async (
  e: React.FormEvent,
  email: string,
  password: string,
  confirmPassword: string,
  setError: React.Dispatch<React.SetStateAction<string>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  signUp: (email: string, password: string) => Promise<UserCredential>
) => {
  e.preventDefault();
  setError("");

  if (!validatePassword(password, confirmPassword, setError)) {
    return;
  }

  setLoading(true);

  try {
    await signUp(email, password);
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

export const handleGoogleSignUp = async (
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
        setError("Sign-up cancelled.");
      } else {
        setError(getErrorMessage(err));
      }
    } else {
      setError("An unexpected error occurred.");
    }
    setGoogleLoading(false); // Only reset loading on error
  }
};
