export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {
      overrideBrowserslist: [
        'last 2 versions',
        '> 1%',
        'Firefox ESR',
        'not dead'
      ],
      flexbox: 'no-2009',
      grid: 'autoplace', // Better grid support
      remove: false // Don't remove invalid prefixes
    },
  },
}
