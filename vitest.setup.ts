import "vitest-canvas-mock";

// If you need any additional setup, you can add it here
import { vi } from "vitest";

// Mock URL.createObjectURL if needed
global.URL.createObjectURL = vi.fn(() => "mock-object-url");
