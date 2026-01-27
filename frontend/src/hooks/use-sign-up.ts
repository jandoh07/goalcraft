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
  signUp: (email: string, password: string) => Promise<UserCredential>,
  redirectTo: string = "/goals"
) => {
  e.preventDefault();
  setError("");

  if (!validatePassword(password, confirmPassword, setError)) {
    return;
  }

  setLoading(true);

  try {
    // signUp now includes session cookie creation (awaited inside auth context)
    await signUp(email, password);
    // Use full page redirect to ensure proxy processes the new session
    // The signUp function awaits createSession, so cookie should be set by now
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

export const handleGoogleSignUp = async (
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
