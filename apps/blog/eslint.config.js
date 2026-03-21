import astroConfig from "@hr/eslint-config/astro";

export default [
  ...astroConfig,
  { ignores: ["dist/**", ".astro/**", "public/pagefind/**"] },
];
