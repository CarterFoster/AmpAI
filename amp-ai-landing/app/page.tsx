import Head from 'next/head'
import Button from '../components/Button'

export default function Home() {
  return (
    <>
      <Head>
        <title>AMP.ai — Find Your Tone</title>
        <meta name="description" content="AMP.ai — Find your tone. AI amp settings and interactive UI." />
      </Head>

      <main className="min-h-screen w-full">
        {/* Hero */}
        <section
          className="relative min-h-screen hero-bg"
          style={{
            backgroundImage: "url('/hero.jpg')"
          }}
          aria-label="AMP.ai hero"
        >
          {/* dark overlay */}
          <div className="absolute inset-0 bg-black opacity-60"></div>

          {/* main content centered */}
          <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
            <div className="max-w-3xl text-center">
              {/* Large heading */}
              <h1 className="font-display text-white text-[96px] leading-[0.95] sm:text-7xl md:text-8xl lg:text-[120px] drop-shadow-lg">
                AMP.ai
              </h1>

              {/* Subhead — lighter color, bigger letter spacing */}
              <p className="mt-2 text-gray-300 text-2xl sm:text-3xl tracking-wide">
                Find Your Tone
              </p>

              {/* Buttons row */}
              <div className="mt-32 flex items-center justify-center gap-8">
                <div className="rounded-md overflow-hidden">
                  <Button variant="solid">Sign Up</Button>
                </div>
                <div className="rounded-md overflow-hidden">
                  <Button variant="outline">Log In</Button>
                </div>
              </div>
            </div>
          </div>

        </section>
      </main>
    </>
  )
}
