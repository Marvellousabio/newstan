/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: [
        './src/app/**/*.{js,ts,jsx,tsx}',
        './src/components/**/*.{js,ts,jsx,tsx}',
        './src/contexts/**/*.{js,ts,jsx,tsx}',
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: 'rgb(var(--primary) / <alpha-value>)',
                'primary-foreground': 'rgb(var(--primary-foreground) / <alpha-value>)',
                secondary: 'rgb(var(--secondary) / <alpha-value>)',
                'secondary-foreground': 'rgb(var(--secondary-foreground) / <alpha-value>)',
                muted: 'rgb(var(--muted) / <alpha-value>)',
                'muted-foreground': 'rgb(var(--muted-foreground) / <alpha-value>)',
                accent: 'rgb(var(--accent) / <alpha-value>)',
                'accent-foreground': 'rgb(var(--accent-foreground) / <alpha-value>)',
                destructive: 'rgb(var(--destructive) / <alpha-value>)',
                'destructive-foreground': 'rgb(var(--destructive-foreground) / <alpha-value>)',
                border: 'rgb(var(--border) / <alpha-value>)',
                input: 'rgb(var(--input) / <alpha-value>)',
                ring: 'rgb(var(--ring) / <alpha-value>)',
                background: 'rgb(var(--background) / <alpha-value>)',
                foreground: 'rgb(var(--foreground) / <alpha-value>)',
                card: 'rgb(var(--card) / <alpha-value>)',
                'card-foreground': 'rgb(var(--card-foreground) / <alpha-value>)',
            },
        },
    },
    plugins: [],
};
