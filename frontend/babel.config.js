// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }], // لتحويل الكود ليكون متوافقًا مع الإصدار الحالي من Node.js
    ['@babel/preset-react', { runtime: 'automatic' }],  // لدعم JSX و React
  ],
  plugins: [
    '@babel/plugin-transform-runtime', // لتحسينات التوافق والأداء
  ],
  ignore: [/node_modules\/(?!(@react-financial-charts|react-financial-charts|d3-format|d3-time-format))/], // تحويل الوحدات من node_modules باستثناء المحددة
};
