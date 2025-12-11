/**
 * Tiger ASCII art for various terminal commands
 */

/**
 * Small tiger for neofetch and cowsay
 */
export const TIGER_SMALL = `      |\\      _,,,---,,_
ZZZzz /,\`.-'\`'    -.  ;-;;,_
     |,4-  ) )-,_. ,\\ (  \`'-'
    '---''(_/--'  \`-'\\_)`;

/**
 * Tiger for cowsay - without the zzz
 */
export const TIGER_COWSAY = `    \\
     \\  |\\      _,,,---,,_
       /,\`.-'\`'    -.  ;-;;,_
      |,4-  ) )-,_. ,\\ (  \`'-'
     '---''(_/--'  \`-'\\_)`;

/**
 * Generate cowsay-style speech bubble with tiger
 */
export function tigerSay(message: string): string {
  const maxWidth = 40;
  const words = message.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (currentLine.length + word.length + 1 <= maxWidth) {
      currentLine += (currentLine ? " " : "") + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  const width = Math.max(...lines.map((l) => l.length));
  const border = "-".repeat(width + 2);

  let bubble: string;
  if (lines.length === 1) {
    bubble = ` ${"_".repeat(width + 2)}\n< ${lines[0].padEnd(width)} >\n ${border}`;
  } else {
    const top = ` ${"_".repeat(width + 2)}`;
    const bottom = ` ${border}`;
    const middle = lines.map((line, i) => {
      const padded = line.padEnd(width);
      if (i === 0) return `/ ${padded} \\`;
      if (i === lines.length - 1) return `\\ ${padded} /`;
      return `| ${padded} |`;
    });
    bubble = [top, ...middle, bottom].join("\n");
  }

  return `${bubble}\n${TIGER_COWSAY}`;
}

/**
 * Neofetch-style output with tiger
 */
export function neofetch(): string {
  const info = [
    "hobbescodes@website",
    "------------------",
    "OS: hobbescodes.dev",
    "Shell: vim-mode 1.0",
    "Theme: Catppuccin Mocha",
    "Terminal: Ghostty",
    "Languages: TypeScript, Rust, Go",
    "Editor: Neovim btw",
    "Uptime: since 1995",
  ];

  const tigerLines = TIGER_SMALL.split("\n");
  const maxTigerWidth = Math.max(...tigerLines.map((l) => l.length));

  const output: string[] = [];
  const maxLines = Math.max(tigerLines.length, info.length);

  for (let i = 0; i < maxLines; i++) {
    const tigerPart = (tigerLines[i] || "").padEnd(maxTigerWidth + 4);
    const infoPart = info[i] || "";
    output.push(tigerPart + infoPart);
  }

  return output.join("\n");
}

/**
 * Whoami ASCII art
 */
export const WHOAMI = `🐯 hobbescodes
Tiger by day, developer by night.`;

/**
 * Hackerman easter egg
 */
export const HACKERMAN = `
██╗  ██╗ █████╗  ██████╗██╗  ██╗███████╗██████╗ ███╗   ███╗ █████╗ ███╗   ██╗
██║  ██║██╔══██╗██╔════╝██║ ██╔╝██╔════╝██╔══██╗████╗ ████║██╔══██╗████╗  ██║
███████║███████║██║     █████╔╝ █████╗  ██████╔╝██╔████╔██║███████║██╔██╗ ██║
██╔══██║██╔══██║██║     ██╔═██╗ ██╔══╝  ██╔══██╗██║╚██╔╝██║██╔══██║██║╚██╗██║
██║  ██║██║  ██║╚██████╗██║  ██╗███████╗██║  ██║██║ ╚═╝ ██║██║  ██║██║ ╚████║
╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝
                    I'm in.`;
