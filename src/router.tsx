import { createRouter } from "@tanstack/react-router";

import { NotFound } from "@/components/NotFound";
import { routeTree } from "@/routeTree.gen";

export const getRouter = () => {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultNotFoundComponent: NotFound,
  });

  return router;
};
