/** @type {import("prettier").Config} */
const config = {
  endOfLine: 'lf',
  printWidth: 100,
  semi: true,
  singleQuote: true,
  jsxSingleQuote: false,
  tabWidth: 2,
  trailingComma: 'es5',
  plugins: [require.resolve('prettier-plugin-tailwindcss')],
};

module.exports = config;
