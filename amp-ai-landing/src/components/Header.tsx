import { Guitar, User } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { AuthDialog } from "./AuthDialog";

export function Header() {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const handleAuthClick = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-900/80 backdrop-blur-md border-b border-amber-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Guitar className="size-8 text-amber-500" />
              <span className="text-amber-500">AMP.ai</span>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => handleAuthClick("login")}
                className="text-zinc-300 hover:text-amber-500 hover:bg-amber-500/10"
              >
                <User className="size-4 mr-2" />
                Log In
              </Button>
              <Button
                onClick={() => handleAuthClick("signup")}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      <AuthDialog
        open={showAuth}
        onOpenChange={setShowAuth}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </>
  );
}
