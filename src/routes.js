import express from 'express';
import subdomainRoutes from './domains/v1/subdomain/subdomain-routes.js';

const router = express.Router();

const RoutesV1 = [
  {
    path: '/subdomain',
    route: subdomainRoutes.v1,
  }
];

// const RoutesV2 = [
//     {
//         path: '/auth',
//         route: authRoutes.v2
//     }
// ]

// const appsRoutes = [

// ];

RoutesV1.forEach((route) => {
  router.use(`/v1/${route.path}`, route.route);
});

// RoutesV2.forEach((route) => {
//     router.use(`/v2/${route.path}`, route.route);
// })

export default router;