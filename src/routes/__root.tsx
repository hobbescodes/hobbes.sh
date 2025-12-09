import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";

import { NavigationProvider } from "@/context/NavigationContext";
import ThemeProvider from "@/context/ThemeContext";
import { getTheme } from "@/server/functions/theme";
import appCss from "@/styles.css?url";

export const Route = createRootRoute({
  beforeLoad: async () => {
    const theme = await getTheme();
    return { theme };
  },
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "HobbesCodes",
      },
      {
        name: "description",
        content:
          "Software engineer and tiger enthusiast. Building things on the internet.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),

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
            <Outlet />
          </NavigationProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
