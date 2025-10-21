require("@testing-library/jest-dom");

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => "/",
}));

// Mock Next.js image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement("img", props);
  },
}));

// Mock environment variables
process.env.NODE_ENV = "test";
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
process.env.GEMINI_API_KEY = "test-gemini-key";
process.env.OPENAI_API_KEY = "test-openai-key";

// Mock toast notifications
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}));

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Suppress console warnings in tests
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === "string" &&
    args[0].includes("Warning: ReactDOM.render is no longer supported")
  ) {
    return;
  }
  originalConsoleWarn.call(console, ...args);
};
