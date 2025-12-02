import { Search, Cpu, Settings } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Enter Your Song",
    description: "Simply type in the song and artist you want to play. Our database covers thousands of iconic tracks.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "AI Analysis",
    description: "Our AI analyzes the guitar tone, identifying the exact amp characteristics and settings used.",
  },
  {
    icon: Settings,
    step: "03",
    title: "Get Your Settings",
    description: "Receive detailed amp settings you can dial in immediately. Start playing with the perfect tone.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 relative bg-zinc-800/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-zinc-100 mb-4">How It Works</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Three simple steps to unlock the perfect guitar tone
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-amber-500/50 to-transparent z-0" />
                )}

                <div className="relative z-10 text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-2 border-amber-500/30 rounded-full mb-6">
                    <Icon className="size-10 text-amber-500" />
                  </div>
                  <div className="text-amber-500/50 mb-2">{step.step}</div>
                  <h3 className="text-zinc-100 mb-3">{step.title}</h3>
                  <p className="text-zinc-400">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual Example */}
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-lg overflow-hidden border border-amber-500/20">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1674485146230-d654464e477c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxndWl0YXIlMjBzdHJpbmdzJTIwY2xvc2V1cHxlbnwxfHx8fDE3NjQ1NjUzMDJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Guitar strings closeup"
              className="w-full h-64 object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-zinc-100 text-center px-4">
                "The tone settings were spot-on. I couldn't believe how close I got to the original sound."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
