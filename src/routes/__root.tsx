import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";

import { NotFound } from "@/components/NotFound";
import { NavigationProvider } from "@/context/NavigationContext";
import { PaneProvider } from "@/context/PaneContext";
import ThemeProvider from "@/context/ThemeContext";
import { seo } from "@/lib/seo";
import { getColorscheme } from "@/server/functions/theme";
import appCss from "@/styles.css?url";

import type { QueryClient } from "@tanstack/react-query";

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async () => {
    const colorscheme = await getColorscheme();
    return { colorscheme };
  },
  notFoundComponent: NotFound,
  head: () => {
    const { meta, links } = seo({ title: "hobbescodes", url: "/" });
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        ...meta,
      ],
      links: [{ rel: "stylesheet", href: appCss }, ...links],
    };
  },

  component: RootComponent,
});

function RootComponent() {
  const { colorscheme } = Route.useRouteContext();

  return (
    <html lang="en" className={colorscheme}>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider colorscheme={colorscheme}>
          <NavigationProvider>
            <PaneProvider>
              <Outlet />
            </PaneProvider>
          </NavigationProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
