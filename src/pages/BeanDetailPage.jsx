import { Link, useParams } from "react-router-dom";
import Seo from "../components/Seo";
import { beans } from "../data/beans";

export default function BeanDetailPage() {
  const { slug } = useParams();
  const bean = beans.find((item) => item.slug === slug);

  if (!bean) {
    return (
      <>
        <Seo
          title="Coffee Not Found"
          description="The coffee page you are looking for could not be found."
          url="/beans/not-found"
        />
        <div className="min-h-screen bg-black px-6 py-16 text-white">
          <div className="mx-auto max-w-4xl">
            <p className="text-sm uppercase tracking-[0.2em] text-white/50">
              Drunk Coffee Roasters
            </p>
            <h1 className="mt-4 text-4xl font-semibold">Coffee not found</h1>
            <p className="mt-4 text-white/70">
              This coffee page does not exist.
            </p>
            <Link
              to="/coffee-beans"
              className="mt-8 inline-block rounded-2xl border border-white/15 px-5 py-3 text-sm text-white transition hover:bg-white/5"
            >
              Back to Coffee Beans
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Seo
        title={`${bean.name} Coffee Beans`}
        description={`${bean.name} from ${bean.origin}. Notes: ${bean.notes.join(
          ", "
        )}. Explore roast details, process, and brewing style.`}
        url={`/beans/${bean.slug}`}
        image={`https://drunkcoffeeroasters.com${bean.image}`}
      />

      <div className="min-h-screen bg-black px-6 py-16 text-white">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/coffee-beans"
            className="inline-block text-sm text-white/60 transition hover:text-white"
          >
            ← Back to Coffee Beans
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5">
              <img
                src={bean.image}
                alt={bean.name}
                className="h-full w-full object-cover"
              />
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-white/45">
                {bean.category}
              </p>

              <h1 className="mt-3 text-4xl font-semibold md:text-5xl">
                {bean.name}
              </h1>

              <p className="mt-5 text-lg leading-8 text-white/72">
                {bean.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {bean.notes.map((note) => (
                  <span
                    key={note}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs uppercase tracking-[0.08em] text-white/75"
                  >
                    {note}
                  </span>
                ))}
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 p-4">
                  <p className="text-sm text-white/40">Origin</p>
                  <p className="mt-2 text-white/85">{bean.origin}</p>
                </div>

                <div className="rounded-2xl border border-white/10 p-4">
                  <p className="text-sm text-white/40">Process</p>
                  <p className="mt-2 text-white/85">{bean.process}</p>
                </div>

                <div className="rounded-2xl border border-white/10 p-4">
                  <p className="text-sm text-white/40">Roast</p>
                  <p className="mt-2 text-white/85">{bean.roast}</p>
                </div>

                <div className="rounded-2xl border border-white/10 p-4">
                  <p className="text-sm text-white/40">Price</p>
                  <p className="mt-2 text-white/85">RM {bean.price}</p>
                </div>
              </div>

              <div className="mt-8">
                <a
                  href={`https://wa.me/601127060012?text=${encodeURIComponent(
                    `Hi Drunk Coffee Roasters, I would like to order ${bean.name} (${bean.size}).`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block rounded-2xl bg-white px-6 py-3 text-sm font-medium text-neutral-950 transition hover:opacity-90"
                >
                  Order on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}