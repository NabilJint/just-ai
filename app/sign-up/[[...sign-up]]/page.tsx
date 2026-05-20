import { SignUp } from "@clerk/nextjs";
import AuthSidePanel from "@/components/auth/auth-side-panel";
import { authAppearance } from "@/components/auth/appearance";

export default function SignUpPage() {
  return (
    <div className="min-h-screen w-full flex bg-bg-base text-text-primary select-none">
      {/* Left Panel: Reusable side panel */}
      <AuthSidePanel />

      {/* Right Panel: Centered Sign-Up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-bg-base">
        <SignUp appearance={authAppearance} />
      </div>
    </div>
  );
}
