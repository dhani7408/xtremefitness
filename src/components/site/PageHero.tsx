export default function PageHero({
  title,
  subtitle,
  image,
}: {
  title: string;
  subtitle?: string;
  image: string;
}) {
  return (
    <section
      className="parallax-bg relative flex h-[45vh] items-center justify-center text-center text-white"
      style={{
        backgroundImage: `linear-gradient(rgba(11,11,13,0.75), rgba(11,11,13,0.75)), url(${image})`,
      }}
    >
      <div className="section">
        <h1 className="font-display text-5xl font-extrabold md:text-6xl">{title}</h1>
        {subtitle && (
          <p className="mx-auto mt-3 max-w-2xl text-white/80">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
