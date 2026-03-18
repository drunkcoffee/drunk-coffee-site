import { Helmet } from "react-helmet-async";

export default function Seo({
  title,
  description,
  url = "/",
  image = "https://drunkcoffeeroasters.com/hero-coffee.jpg",
}) {
  const fullTitle = title
    ? `${title} | Drunk Coffee Roasters`
    : "Drunk Coffee Roasters | Specialty Coffee Roaster in Malaysia";

  const fullDescription =
    description ||
    "Fresh roasted specialty coffee beans in Malaysia for filter, espresso, and wholesale supply.";

  const fullUrl = `https://drunkcoffeeroasters.com${url}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <link rel="canonical" href={fullUrl} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}