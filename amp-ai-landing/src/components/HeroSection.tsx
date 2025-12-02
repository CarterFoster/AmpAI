import { Button } from "./ui/button";
import { Sparkles } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function HeroSection() {
  const handleFindTone = () => {
    // This would navigate to the main tone finding tool
    console.log("Navigate to tone finder");
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1651912170375-5d25d534b4c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMGd1aXRhciUyMGFtcGxpZmllcnxlbnwxfHx8fDE3NjQ2NTI0Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Electric guitar and amplifier"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/80 to-zinc-900/40" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Logo/Brand */}
          <div className="inline-block">
            <div className="flex items-center gap-3 px-6 py-3 bg-amber-500/10 rounded-full border border-amber-500/30">
              <Sparkles className="size-5 text-amber-500" />
              <span className="text-amber-500">AI-Powered Tone Matching</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-zinc-100">
            Find Your Perfect Amp Tone
            <br />
            <span className="text-amber-500">For Any Song</span>
          </h1>

          {/* Subheadline */}
          <p className="text-zinc-300 max-w-2xl mx-auto">
            Stop tweaking endlessly. Just tell AMP.ai what song you want to play, and get the exact amp settings to nail that iconic tone instantly.
          </p>

          {/* CTA Button */}
          <div className="pt-4">
            <Button
              onClick={handleFindTone}
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 text-white px-12 py-6 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all"
            >
              Find Your Tone
            </Button>
          </div>

          {/* Supporting Text */}
          <p className="text-zinc-500">
            Join thousands of guitarists who've found their sound
          </p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-900 to-transparent z-10" />
    </section>
  );
}
