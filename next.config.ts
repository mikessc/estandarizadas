import type { NextConfig } from "next";

const config: NextConfig = {
  // Los JSON se leen con fs en tiempo de ejecución: incluirlos en el bundle de Vercel.
  outputFileTracingIncludes: { "/**": ["./data/exams/**"] },
};

export default config;
