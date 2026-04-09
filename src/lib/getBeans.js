import { client } from "./contentful";

export async function getBeans() {
  const res = await client.getEntries({
    content_type: "drunkCoffeeRoasters",
  });

  return res.items.map((item) => {
    const fields = item.fields;

    return {
      id: item.sys.id,
      slug: fields.slug,
      name: fields.name,
      description: fields.description,
      origin: fields.origin,
      process: fields.process,
      roast: fields.roast,
      price: fields.price,
      notes: fields.notes || [],
      image: fields.image?.fields?.file?.url
        ? `https:${fields.image.fields.file.url}`
        : "",
    };
  });
}