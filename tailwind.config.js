import { createThemes } from "tw-colors";

/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{html,js,svelte,ts}"],
    darkMode: "class",
    theme: {
        extend: {
            fontFamily: {
                // prettier-ignore
                sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "Noto Sans", "sans-serif", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"],
            },
        },
        transitionDuration: {
            DEFAULT: "100ms",
            75: "75ms",
            100: "100ms",
            150: "150ms",
            200: "200ms",
            300: "300ms",
            500: "500ms",
            700: "700ms",
            1000: "1000ms",
        },
    },
    plugins: [
        createThemes({
            light: {
                theme: {
                    50: "#fafafa",
                    100: "#f4f4f5",
                    200: "#e4e4e7",
                    300: "#d4d4d8",
                    400: "#a1a1aa",
                    500: "#71717a",
                    600: "#525252",
                    700: "#404040",
                },
            },
            dark: {
                theme: {
                    50: "#171717",
                    100: "#262626",
                    200: "#404040",
                    300: "#525252",
                    400: "#71717a",
                    500: "#a1a1aa",
                    600: "#a1a1aa",
                    700: "#e4e4e7",
                },
            },
        }, {
            defaultTheme: "light",
        })
    ],
};
