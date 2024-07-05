module.exports = {
    apps: [
      {
        name: 'my-app',
        script: 'index.js', // Replace with your entry point file
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
          NODE_ENV: 'production',
        },
      },
    ],
  };
  