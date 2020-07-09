import { DatavTheme } from '../../data';
import tinycolor from 'tinycolor2';

export function cardChrome(theme: DatavTheme): string {
  return `
       background: ${theme.colors.bg2};
       &:hover {
         background: ${hoverColor(theme.colors.bg2, theme)};
       }
       box-shadow: ${theme.shadows.listItem};
       border-radius: ${theme.border.radius.md};
    `;
}

export function hoverColor(color: string, theme: DatavTheme): string {
  return theme.isDark
    ? tinycolor(color)
        .brighten(2)
        .toString()
    : tinycolor(color)
        .darken(2)
        .toString();
}

export function listItem(theme: DatavTheme): string {
  return `
  background: ${theme.colors.bg2};
  &:hover {
    background: ${hoverColor(theme.colors.bg2, theme)};
  }
  box-shadow: ${theme.shadows.listItem};
  border-radius: ${theme.border.radius.md};
`;
}

export function listItemSelected(theme: DatavTheme): string {
  return `
       background: ${hoverColor(theme.colors.bg2, theme)};
       color: ${theme.colors.textStrong};
    `;
}

export const focusCss = (theme: DatavTheme) => `
  outline: 2px dotted transparent;
  outline-offset: 2px;
  box-shadow: 0 0 0 2px ${theme.colors.bodyBg}, 0 0 0px 4px ${theme.colors.formFocusOutline};
  transition: all 0.2s cubic-bezier(0.19, 1, 0.22, 1);
`;
