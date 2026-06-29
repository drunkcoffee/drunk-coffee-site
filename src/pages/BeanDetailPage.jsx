import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getBeans } from "../lib/getBeans";
import Seo from "../components/Seo";

export default function BeanDetailPage() {
  const { slug } = useParams();
  const [bean, setBean] = useState(null);

  useEffect(() => {
    getBeans().then((data) => {
      const found = data.find((b) => b.slug === slug);
      setBean(found);
    });
  }, [slug]);

  if (!bean) return <div className="text-white p-10">Loading...</div>;

  return (
    <>
      <Seo
        title={`${bean.name} Coffee Beans`}
        description={bean.description}
        url={`/beans/${bean.slug}`}
      />

      <div className="bg-black text-white p-6">
        <h1 className="text-4xl">{bean.name}</h1>

        <img src={bean.image} alt={bean.name} />

        <p>{bean.description}</p>
        <p>{bean.origin}</p>
        <p>{bean.process}</p>
      </div>
    </>
  );
}
