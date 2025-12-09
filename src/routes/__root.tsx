import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";

import { NotFound } from "@/components/NotFound";
import { NavigationProvider } from "@/context/NavigationContext";
import { PaneProvider } from "@/context/PaneContext";
import ThemeProvider from "@/context/ThemeContext";
import { seo } from "@/lib/seo";
import { getTheme } from "@/server/functions/theme";
import appCss from "@/styles.css?url";

export const Route = createRootRoute({
  beforeLoad: async () => {
    const theme = await getTheme();
    return { theme };
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
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "icon", href: "/favicon.ico" },
        ...links,
      ],
    };
  },

  component: RootComponent,
});

function RootComponent() {
  const { theme } = Route.useRouteContext();

  return (
    <html lang="en" className={theme}>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider theme={theme}>
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
