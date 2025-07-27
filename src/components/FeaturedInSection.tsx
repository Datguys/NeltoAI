export function FeaturedInSection() {
  const logos = [
    'TechCrunch',
    'Product Hunt',
    'Hacker News',
    'Y Combinator',
    'AngelList',
    'Indie Hackers'
  ];

  return (
    <section className="py-16 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-muted-foreground text-sm font-medium mb-8">
          FEATURED IN
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12 opacity-60 hover:opacity-80 transition-opacity duration-300">
          {logos.map((logo, index) => (
            <div
              key={logo}
              className="text-lg font-semibold text-muted-foreground hover:text-foreground transition-colors duration-200"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}