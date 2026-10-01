import path from 'node:path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Silencia o aviso de "múltiplos lockfiles": o workspace inteiro tem package.json
  // próprio na raiz (scripts do resto do projeto), sem relação com este app.
  turbopack: { root: path.resolve(import.meta.dirname) },
};
export default nextConfig;
