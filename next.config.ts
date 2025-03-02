module.exports = {
  async rewrites() {
    return [
      {
        source: '/projects/:username',
        destination: '/',
      },
      {
        source: '/projects/:username/:path*',
        destination: '/:path*',
      },
    ];
  },
};
