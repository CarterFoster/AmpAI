import { Button } from "./ui/button";
import { Guitar } from "lucide-react";

export function CTASection() {
  const handleFindTone = () => {
    // This would navigate to the main tone finding tool
    console.log("Navigate to tone finder");
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 via-transparent to-amber-500/5" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-500/10 border border-amber-500/30 rounded-full">
            <Guitar className="size-10 text-amber-500" />
          </div>

          {/* Headline */}
          <h2 className="text-zinc-100">
            Ready to Find Your Perfect Tone?
          </h2>

          {/* Description */}
          <p className="text-zinc-300">
            Stop struggling with amp settings and start playing the music you love with confidence. Whether you're covering classics or exploring new sounds, AMP.ai has you covered.
          </p>

          {/* CTA Button */}
          <div className="pt-4">
            <Button
              onClick={handleFindTone}
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 text-white px-16 py-6 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all"
            >
              Find Your Tone
            </Button>
          </div>

          {/* Supporting Text */}
          <p className="text-zinc-500">
            Free to try • No credit card required
          </p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
    </section>
  );
}
