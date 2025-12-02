import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "login" | "signup";
  onModeChange: (mode: "login" | "signup") => void;
}

export function AuthDialog({ open, onOpenChange, mode, onModeChange }: AuthDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-800 border-amber-500/20 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="text-amber-500">
            {mode === "login" ? "Welcome Back" : "Join AMP.ai"}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            {mode === "login"
              ? "Log in to access your saved tones and preferences"
              : "Create an account to save your favorite amp settings"}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-200">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-200">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500"
            />
          </div>

          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-zinc-200">
                Confirm Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500"
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          >
            {mode === "login" ? "Log In" : "Sign Up"}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => onModeChange(mode === "login" ? "signup" : "login")}
            className="text-amber-500 hover:text-amber-400"
          >
            {mode === "login"
              ? "Don't have an account? Sign up"
              : "Already have an account? Log in"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
