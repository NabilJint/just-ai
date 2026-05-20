import { SignIn } from "@clerk/nextjs";
import AuthSidePanel from "@/components/auth/auth-side-panel";
import { authAppearance } from "@/components/auth/appearance";

export default function SignInPage() {
  return (
    <div className="min-h-screen w-full flex bg-bg-base text-text-primary select-none">
      {/* Left Panel: Reusable side panel */}
      <AuthSidePanel />

      {/* Right Panel: Centered Sign-In Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-bg-base">
        <SignIn appearance={authAppearance} />
      </div>
    </div>
  );
}
