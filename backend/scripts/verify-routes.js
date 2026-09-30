const app = require('../app');

console.log('--- Verifying Registered Express Endpoints ---');
const routes = [];

function printRoutes(stack, prefix = '') {
  stack.forEach(layer => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
      routes.push(`${methods.padEnd(8)} ${prefix}${layer.route.path}`);
    } else if (layer.name === 'router' && layer.handle.stack) {
      let nextPrefix = prefix;
      if (layer.regexp.source !== '^\\/?(?=\\/|$)') {
        const match = layer.regexp.source
          .replace('\\/?(?=\\/|$)', '')
          .replace('^\\/', '/')
          .replace('\\/', '/')
          .replace(/\\\//g, '/');
        nextPrefix = `${prefix}${match}`.replace(/\/+/g, '/');
      }
      printRoutes(layer.handle.stack, nextPrefix);
    }
  });
}

printRoutes(app._router.stack);
routes.sort().forEach(r => console.log(r));
console.log(`Total Registered Endpoints: ${routes.length}`);
process.exit(0);
