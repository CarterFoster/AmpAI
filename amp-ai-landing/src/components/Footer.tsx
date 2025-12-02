import { Guitar } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-amber-500/20 bg-zinc-900/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Guitar className="size-6 text-amber-500" />
              <span className="text-amber-500">AMP.ai</span>
            </div>
            <p className="text-zinc-400">
              AI-powered amp tone matching for guitarists.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-zinc-100 mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-zinc-400 hover:text-amber-500 transition-colors">
                  Tone Finder
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-400 hover:text-amber-500 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-400 hover:text-amber-500 transition-colors">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-zinc-100 mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-zinc-400 hover:text-amber-500 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-400 hover:text-amber-500 transition-colors">
                  Tutorials
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-400 hover:text-amber-500 transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-zinc-100 mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-zinc-400 hover:text-amber-500 transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-400 hover:text-amber-500 transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-400 hover:text-amber-500 transition-colors">
                  Privacy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-amber-500/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-zinc-500">
              © 2025 AMP.ai. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-zinc-500 hover:text-amber-500 transition-colors">
                Terms
              </a>
              <a href="#" className="text-zinc-500 hover:text-amber-500 transition-colors">
                Privacy
              </a>
              <a href="#" className="text-zinc-500 hover:text-amber-500 transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
