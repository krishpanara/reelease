/**
 * Configure fonts here.
 * To change the font family across the whole project,
 * simply change the configuration below.
 *
 * This setup allows using external Google Fonts links safely in Next.js,
 * avoiding errors with "next/font/google" for specific proprietary 
 * or variable font versions like Google Sans Flex.
 */

export const fontConfig = {
  // The font family name to be used in CSS
  family: "'Plus Jakarta Sans',sans-serif",
  
  // The CSS variable name
  variable: '--font-sans',
  
  // Google Fonts embed URL
  url: 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"',
}
