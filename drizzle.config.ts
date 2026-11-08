const config = {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite" as const,
};

export default config;
