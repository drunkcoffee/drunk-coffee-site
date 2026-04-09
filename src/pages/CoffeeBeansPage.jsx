import { useEffect, useState } from "react";
import { getBeans } from "../lib/getBeans";
import Seo from "../components/Seo";
import { Link } from "react-router-dom";

export default function CoffeeBeansPage() {
  const [beans, setBeans] = useState([]);

  useEffect(() => {
    getBeans().then(setBeans);
  }, []);

  return (
    <>
      <Seo title="Coffee Beans Malaysia" description="Specialty coffee beans" />

      <div className="min-h-screen bg-black text-white p-6">
        <h1 className="text-3xl mb-6">Coffee Beans</h1>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {beans.map((bean) => (
            <div key={bean.id}>
              <img src={bean.image} alt={bean.name} />
              <h2>{bean.name}</h2>

              <Link to={`/beans/${bean.slug}`}>
                View details
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}