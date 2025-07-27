import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { vi } from 'vitest';

// Create a new QueryClient for each test to avoid test pollution
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Infinity,
    },
    mutations: {
      retry: false,
    },
  },
});

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  queryClient?: QueryClient;
}

const AllTheProviders = ({ 
  children, 
  queryClient = createTestQueryClient(),
  initialEntries = ['/']
}: { 
  children: React.ReactNode;
  queryClient?: QueryClient;
  initialEntries?: string[];
}) => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  {
    queryClient,
    initialEntries,
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders queryClient={queryClient} initialEntries={initialEntries}>
      {children}
    </AllTheProviders>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Mock user data for tests
export const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
};

// Mock project data for tests
export const mockProject = {
  id: 'test-project-id',
  name: 'Test Project',
  category: 'SaaS',
  description: 'A test project for unit testing',
  budget: {
    allocated: 10000,
    spent: 2500,
  },
  timeline: {
    startDate: '2024-01-01',
    endDate: '2024-06-01',
  },
  userId: 'test-user-id',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

// Mock AI response for tests
export const mockAIResponse = {
  content: 'This is a mock AI response for testing purposes.',
  usage: {
    prompt_tokens: 50,
    completion_tokens: 100,
    total_tokens: 150,
  },
};

// Helper to mock fetch responses
export const mockFetchResponse = (data: unknown, status = 200) => {
  const mockResponse = {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  };
  
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse as Response);
  return mockResponse;
};

// Helper to mock localStorage with initial data
export const mockLocalStorage = (data: Record<string, string> = {}) => {
  const storage = { ...data };
  
  const localStorageMock = {
    getItem: vi.fn((key: string) => storage[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      storage[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete storage[key];
    }),
    clear: vi.fn(() => {
      Object.keys(storage).forEach(key => delete storage[key]);
    }),
    length: 0,
    key: vi.fn(),
  };
  
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
  
  return localStorageMock;
};

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export * from '@testing-library/user-event';

// Override the default render export
export { customRender as render };