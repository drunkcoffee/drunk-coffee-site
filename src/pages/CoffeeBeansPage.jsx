import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import { beans } from "../data/beans";

export default function CoffeeBeansPage() {
  return (
    <>
      <Seo
        title="Coffee Beans Malaysia"
        description="Browse specialty coffee beans from Drunk Coffee Roasters in Malaysia for filter, espresso, and daily brewing."
        url="/coffee-beans"
      />

      <div className="min-h-screen bg-black px-6 py-16 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm uppercase tracking-[0.2em] text-white/50">
            Drunk Coffee Roasters
          </p>
          <h1 className="mt-4 text-4xl font-semibold">Coffee Beans</h1>
          <p className="mt-4 max-w-2xl text-white/70">
            Explore our coffee selection for filter brewing, espresso, and
            everyday cups.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {beans.map((bean) => (
              <article
                key={bean.id}
                className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035]"
              >
                <div className="aspect-[4/3] overflow-hidden bg-white/5">
                  <img
                    src={bean.image}
                    alt={bean.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="p-6">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">
                    {bean.category}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">{bean.name}</h2>
                  <p className="mt-3 text-sm leading-7 text-white/68">
                    {bean.origin}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {bean.notes.map((note) => (
                      <span
                        key={note}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.08em] text-white/70"
                      >
                        {note}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-xl font-semibold">RM {bean.price}</p>
                    <Link
                      to={`/beans/${bean.slug}`}
                      className="rounded-2xl border border-white/15 px-4 py-2 text-sm text-white transition hover:bg-white/5"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}