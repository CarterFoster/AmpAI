import { Sliders, Zap, BookOpen, Save } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant Tone Matching",
    description: "Get precise amp settings for any song in seconds. No more guesswork or endless tweaking.",
  },
  {
    icon: Sliders,
    title: "Detailed Settings",
    description: "Receive complete amp configurations including gain, EQ, reverb, and effects settings.",
  },
  {
    icon: BookOpen,
    title: "Learn & Improve",
    description: "Understand how classic tones are built and develop your ear for different amp characteristics.",
  },
  {
    icon: Save,
    title: "Save Your Favorites",
    description: "Build your personal tone library and access your saved settings whenever you need them.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-zinc-100 mb-4">
            Everything You Need to Sound Amazing
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            AMP.ai combines cutting-edge AI with decades of guitar tone knowledge to help you achieve professional sound quality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-zinc-800/50 border border-amber-500/10 rounded-lg p-6 hover:border-amber-500/30 transition-all hover:bg-zinc-800/70"
              >
                <div className="inline-flex p-3 bg-amber-500/10 rounded-lg mb-4">
                  <Icon className="size-6 text-amber-500" />
                </div>
                <h3 className="text-zinc-100 mb-2">{feature.title}</h3>
                <p className="text-zinc-400">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
