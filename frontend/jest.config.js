// jest.config.js
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],  // تضمين إعدادات الاختبار
  testEnvironment: 'jsdom',  // بيئة اختبار مشابهة للمتصفح
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(react-financial-charts|@react-financial-charts|d3-format|d3-time-format)/)",
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  moduleDirectories: ['node_modules', 'src'],
  moduleFileExtensions: ['js', 'jsx', 'mjs', 'cjs', 'ts', 'tsx', 'json', 'node'], // تأكد من وجود الامتداد المناسب هنا
};
