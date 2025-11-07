module.exports = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/Home',
        permanent: true, // 308 redirect
      },
    ];
  },
};
