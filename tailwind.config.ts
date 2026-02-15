import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                // Primary Gradient Colors
                primary: {
                    50: "#eef2ff",
                    100: "#e0e7ff",
                    200: "#c7d2fe",
                    300: "#a5b4fc",
                    400: "#818cf8",
                    500: "#6366f1",
                    600: "#4f46e5",
                    700: "#4338ca",
                    800: "#3730a3",
                    900: "#312e81",
                    950: "#1e1b4b",
                },
                // Accent Purple
                accent: {
                    400: "#c084fc",
                    500: "#a855f7",
                    600: "#9333ea",
                },
                // Dark Theme Colors
                dark: {
                    50: "#f8fafc",
                    100: "#f1f5f9",
                    200: "#e2e8f0",
                    300: "#cbd5e1",
                    400: "#94a3b8",
                    500: "#64748b",
                    600: "#475569",
                    700: "#334155",
                    800: "#1e293b",
                    850: "#172033",
                    900: "#0f172a",
                    950: "#0a0f1a",
                },
                // Status Colors
                success: "#10b981",
                warning: "#f59e0b",
                error: "#ef4444",
                info: "#3b82f6",
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
                mono: ["JetBrains Mono", "monospace"],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-primary": "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)",
                "gradient-dark": "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
                "glass": "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
            },
            boxShadow: {
                glow: "0 0 40px rgba(99, 102, 241, 0.3)",
                "glow-sm": "0 0 20px rgba(99, 102, 241, 0.2)",
                "glow-lg": "0 0 60px rgba(99, 102, 241, 0.4)",
                glass: "0 8px 32px rgba(0, 0, 0, 0.3)",
            },
            animation: {
                "fade-in": "fadeIn 0.5s ease-out",
                "slide-up": "slideUp 0.5s ease-out",
                "slide-down": "slideDown 0.3s ease-out",
                "pulse-slow": "pulse 3s ease-in-out infinite",
                "glow": "glow 2s ease-in-out infinite",
                "float": "float 3s ease-in-out infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                slideDown: {
                    "0%": { opacity: "0", transform: "translateY(-10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                glow: {
                    "0%, 100%": { boxShadow: "0 0 20px rgba(99, 102, 241, 0.3)" },
                    "50%": { boxShadow: "0 0 40px rgba(99, 102, 241, 0.6)" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-10px)" },
                },
            },
            backdropBlur: {
                xs: "2px",
            },
            borderRadius: {
                "4xl": "2rem",
            },
        },
    },
    plugins: [],
};

export default config;
