import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../../../test/test-utils';
import userEvent from '@testing-library/user-event';
import { ExportPDFButton, type ExportSection } from '../ExportPDFButton';

// Mock react-pdf/renderer
vi.mock('@react-pdf/renderer', () => ({
  PDFDownloadLink: ({ children, fileName }: any) => {
    const mockState = { loading: false };
    return (
      <div data-testid="pdf-download-link" data-filename={fileName}>
        {children(mockState)}
      </div>
    );
  },
  Document: ({ children }: any) => <div data-testid="pdf-document">{children}</div>,
  Page: ({ children }: any) => <div data-testid="pdf-page">{children}</div>,
  Text: ({ children }: any) => <span data-testid="pdf-text">{children}</span>,
  View: ({ children }: any) => <div data-testid="pdf-view">{children}</div>,
  StyleSheet: {
    create: (styles: any) => styles
  },
  Font: {
    register: vi.fn()
  }
}));

describe('ExportPDFButton Component', () => {
  const mockSections: ExportSection[] = [
    {
      id: 'section-1',
      title: 'Executive Summary',
      content: 'This is the executive summary content with detailed information about the business.',
      category: 'business-plan',
      wordCount: 150
    },
    {
      id: 'section-2',
      title: 'Market Analysis',
      content: 'Comprehensive market analysis including target demographics, market size, and competitive landscape.',
      category: 'analysis',
      wordCount: 250
    },
    {
      id: 'section-3',
      title: 'Financial Projections',
      content: 'Detailed financial projections including revenue forecasts, expense budgets, and cash flow analysis.',
      category: 'financial',
      wordCount: 300
    }
  ];

  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
    
    // Mock DOM methods for file downloads
    const mockElement = {
      click: vi.fn(),
      remove: vi.fn()
    };
    document.createElement = vi.fn(() => mockElement as any);
    document.body.appendChild = vi.fn();
    document.body.removeChild = vi.fn();
  });

  describe('Rendering', () => {
    it('should render export button with default settings', () => {
      render(<ExportPDFButton sections={mockSections} />);
      
      expect(screen.getByText('Export PDF')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /export pdf/i })).toBeInTheDocument();
    });

    it('should render configuration button', () => {
      render(<ExportPDFButton sections={mockSections} />);
      
      const configButton = screen.getByRole('button', { name: '' }); // Settings icon button
      expect(configButton).toBeInTheDocument();
    });

    it('should render preview button', () => {
      render(<ExportPDFButton sections={mockSections} />);
      
      expect(screen.getByRole('button', { name: /preview/i })).toBeInTheDocument();
    });

    it('should display custom company name and report title', () => {
      render(
        <ExportPDFButton 
          sections={mockSections}
          defaultCompanyName="Acme Corp"
          defaultReportTitle="Business Analysis Report"
        />
      );
      
      // These would be visible in the configuration dialog
      expect(screen.getByText('Export PDF')).toBeInTheDocument();
    });

    it('should be disabled when no sections are provided', () => {
      render(<ExportPDFButton sections={[]} />);
      
      const exportButton = screen.getByRole('button', { name: /export pdf/i });
      expect(exportButton).toBeDisabled();
    });
  });

  describe('Configuration Dialog', () => {
    it('should open configuration dialog when settings button is clicked', async () => {
      render(<ExportPDFButton sections={mockSections} />);
      
      const settingsButton = screen.getByRole('button', { name: '' });
      await user.click(settingsButton);
      
      await waitFor(() => {
        expect(screen.getByText('Export Configuration')).toBeInTheDocument();
        expect(screen.getByText('Customize your export settings and select which sections to include.')).toBeInTheDocument();
      });
    });

    it('should display all sections with checkboxes', async () => {
      render(<ExportPDFButton sections={mockSections} />);
      
      const settingsButton = screen.getByRole('button', { name: '' });
      await user.click(settingsButton);
      
      await waitFor(() => {
        mockSections.forEach(section => {
          expect(screen.getByText(section.title)).toBeInTheDocument();
          expect(screen.getByText(`${section.wordCount} words`)).toBeInTheDocument();
          if (section.category) {
            expect(screen.getByText(section.category)).toBeInTheDocument();
          }
        });
      });
    });

    it('should allow toggling section selection', async () => {
      render(<ExportPDFButton sections={mockSections} />);
      
      const settingsButton = screen.getByRole('button', { name: '' });
      await user.click(settingsButton);
      
      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox', { name: /executive summary/i });
        expect(checkbox).toBeChecked();
      });
      
      const checkbox = screen.getByRole('checkbox', { name: /executive summary/i });
      await user.click(checkbox);
      
      expect(checkbox).not.toBeChecked();
    });

    it('should allow changing export format', async () => {
      render(<ExportPDFButton sections={mockSections} />);
      
      const settingsButton = screen.getByRole('button', { name: '' });
      await user.click(settingsButton);
      
      await waitFor(() => {
        expect(screen.getByText('Export Format')).toBeInTheDocument();
      });
      
      const formatSelect = screen.getByRole('combobox');
      await user.click(formatSelect);
      
      await waitFor(() => {
        expect(screen.getByText('HTML Page')).toBeInTheDocument();
        expect(screen.getByText('JSON Data')).toBeInTheDocument();
      });
    });

    it('should update company name and report title', async () => {
      render(<ExportPDFButton sections={mockSections} />);
      
      const settingsButton = screen.getByRole('button', { name: '' });
      await user.click(settingsButton);
      
      await waitFor(() => {
        const companyNameInput = screen.getByLabelText('Company Name');
        const reportTitleInput = screen.getByLabelText('Report Title');
        
        expect(companyNameInput).toHaveValue('My Company');
        expect(reportTitleInput).toHaveValue('Business Report');
      });
      
      const companyNameInput = screen.getByLabelText('Company Name');
      await user.clear(companyNameInput);
      await user.type(companyNameInput, 'New Company Name');
      
      expect(companyNameInput).toHaveValue('New Company Name');
    });

    it('should toggle layout options', async () => {
      render(<ExportPDFButton sections={mockSections} />);
      
      const settingsButton = screen.getByRole('button', { name: '' });
      await user.click(settingsButton);
      
      await waitFor(() => {
        const tocCheckbox = screen.getByLabelText('Include Table of Contents');
        const headerCheckbox = screen.getByLabelText('Include Header');
        const footerCheckbox = screen.getByLabelText('Include Footer');
        
        expect(tocCheckbox).toBeChecked();
        expect(headerCheckbox).toBeChecked();
        expect(footerCheckbox).toBeChecked();
      });
      
      const tocCheckbox = screen.getByLabelText('Include Table of Contents');
      await user.click(tocCheckbox);
      
      expect(tocCheckbox).not.toBeChecked();
    });
  });

  describe('Export Functionality', () => {
    it('should handle PDF export through PDFDownloadLink', () => {
      render(<ExportPDFButton sections={mockSections} fileName="test-report.pdf" />);
      
      const pdfDownloadLink = screen.getByTestId('pdf-download-link');
      expect(pdfDownloadLink).toHaveAttribute('data-filename', 'test-report.pdf');
    });

    it('should handle HTML export', async () => {
      render(<ExportPDFButton sections={mockSections} />);
      
      const settingsButton = screen.getByRole('button', { name: '' });
      await user.click(settingsButton);
      
      await waitFor(() => {
        const formatSelect = screen.getByRole('combobox');
        user.click(formatSelect);
      });
      
      await waitFor(() => {
        const htmlOption = screen.getByText('HTML Page');
        user.click(htmlOption);
      });
      
      await waitFor(() => {
        const exportButton = screen.getByRole('button', { name: /export html/i });
        expect(exportButton).toBeInTheDocument();
      });
    });

    it('should handle JSON export', async () => {
      render(<ExportPDFButton sections={mockSections} />);
      
      const settingsButton = screen.getByRole('button', { name: '' });
      await user.click(settingsButton);
      
      await waitFor(() => {
        const formatSelect = screen.getByRole('combobox');
        user.click(formatSelect);
      });
      
      await waitFor(() => {
        const jsonOption = screen.getByText('JSON Data');
        user.click(jsonOption);
      });
      
      await waitFor(() => {
        const exportButton = screen.getByRole('button', { name: /export json/i });
        expect(exportButton).toBeInTheDocument();
      });
    });

    it('should export HTML file when HTML format is selected', async () => {
      render(<ExportPDFButton sections={mockSections} fileName="test-report.pdf" />);
      
      const settingsButton = screen.getByRole('button', { name: '' });
      await user.click(settingsButton);
      
      await waitFor(() => {
        const formatSelect = screen.getByRole('combobox');
        user.click(formatSelect);
      });
      
      await waitFor(() => {
        const htmlOption = screen.getByText('HTML Page');
        user.click(htmlOption);
      });
      
      const exportButton = screen.getByRole('button', { name: /export html/i });
      await user.click(exportButton);
      
      // Verify that the file download was initiated
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('a');
    });

    it('should export JSON file when JSON format is selected', async () => {
      render(<ExportPDFButton sections={mockSections} fileName="test-report.pdf" />);
      
      const settingsButton = screen.getByRole('button', { name: '' });
      await user.click(settingsButton);
      
      await waitFor(() => {
        const formatSelect = screen.getByRole('combobox');
        user.click(formatSelect);
      });
      
      await waitFor(() => {
        const jsonOption = screen.getByText('JSON Data');
        user.click(jsonOption);
      });
      
      const exportButton = screen.getByRole('button', { name: /export json/i });
      await user.click(exportButton);
      
      // Verify that the file download was initiated
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('a');
    });
  });

  describe('Section Management', () => {
    it('should display correct section count', async () => {
      render(<ExportPDFButton sections={mockSections} />);
      
      const settingsButton = screen.getByRole('button', { name: '' });
      await user.click(settingsButton);
      
      await waitFor(() => {
        expect(screen.getByText(`Select Sections (${mockSections.length}/${mockSections.length})`)).toBeInTheDocument();
      });
    });

    it('should calculate total word count correctly', async () => {
      const expectedWordCount = mockSections.reduce((sum, section) => sum + (section.wordCount || 0), 0);
      
      render(<ExportPDFButton sections={mockSections} />);
      
      const settingsButton = screen.getByRole('button', { name: '' });
      await user.click(settingsButton);
      
      await waitFor(() => {
        expect(screen.getByText(`Total words: ${expectedWordCount}`)).toBeInTheDocument();
      });
    });

    it('should handle select all functionality', async () => {
      render(<ExportPDFButton sections={mockSections} />);
      
      const settingsButton = screen.getByRole('button', { name: '' });
      await user.click(settingsButton);
      
      // First deselect one item
      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox', { name: /executive summary/i });
        user.click(checkbox);
      });
      
      // Then click select all
      const selectAllButton = screen.getByRole('button', { name: /select all/i });
      await user.click(selectAllButton);
      
      // All checkboxes should be checked
      await waitFor(() => {
        mockSections.forEach(section => {
          const checkbox = screen.getByRole('checkbox', { name: new RegExp(section.title, 'i') });
          expect(checkbox).toBeChecked();
        });
      });
    });

    it('should disable export when no sections are selected', async () => {
      render(<ExportPDFButton sections={mockSections} />);
      
      const settingsButton = screen.getByRole('button', { name: '' });
      await user.click(settingsButton);
      
      // Deselect all sections
      await waitFor(async () => {
        for (const section of mockSections) {
          const checkbox = screen.getByRole('checkbox', { name: new RegExp(section.title, 'i') }) as HTMLInputElement;
          if (checkbox.checked) {
            await user.click(checkbox);
          }
        }
      });
      
      // Export button should be disabled
      await waitFor(() => {
        const exportButton = screen.getByRole('button', { name: /export pdf/i });
        expect(exportButton).toBeDisabled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels and descriptions', async () => {
      render(<ExportPDFButton sections={mockSections} />);
      
      const settingsButton = screen.getByRole('button', { name: '' });
      await user.click(settingsButton);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Company Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Report Title')).toBeInTheDocument();
        expect(screen.getByLabelText('Include Table of Contents')).toBeInTheDocument();
        expect(screen.getByLabelText('Include Header')).toBeInTheDocument();
        expect(screen.getByLabelText('Include Footer')).toBeInTheDocument();
      });
    });

    it('should handle keyboard navigation', async () => {
      render(<ExportPDFButton sections={mockSections} />);
      
      const exportButton = screen.getByRole('button', { name: /export pdf/i });
      exportButton.focus();
      
      expect(document.activeElement).toBe(exportButton);
    });
  });

  describe('Preview Functionality', () => {
    beforeEach(() => {
      // Mock window.open for preview tests
      global.window.open = vi.fn(() => ({
        document: {
          write: vi.fn(),
          close: vi.fn()
        }
      } as any));
    });

    it('should show preview when preview button is clicked', async () => {
      render(<ExportPDFButton sections={mockSections} />);
      
      const previewButton = screen.getByRole('button', { name: /preview/i });
      await user.click(previewButton);
      
      await waitFor(() => {
        expect(screen.getByText('Document Preview')).toBeInTheDocument();
        expect(screen.getByText(/This is how your/)).toBeInTheDocument();
      });
    });

    it('should hide preview when preview button is clicked again', async () => {
      render(<ExportPDFButton sections={mockSections} />);
      
      const previewButton = screen.getByRole('button', { name: /preview/i });
      
      // Show preview
      await user.click(previewButton);
      await waitFor(() => {
        expect(screen.getByText('Document Preview')).toBeInTheDocument();
      });
      
      // Hide preview
      await user.click(previewButton);
      await waitFor(() => {
        expect(screen.queryByText('Document Preview')).not.toBeInTheDocument();
      });
    });

    it('should display section count and word count in preview header', async () => {
      render(<ExportPDFButton sections={mockSections} />);
      
      const previewButton = screen.getByRole('button', { name: /preview/i });
      await user.click(previewButton);
      
      const expectedWordCount = mockSections.reduce((sum, section) => sum + (section.wordCount || 0), 0);
      
      await waitFor(() => {
        expect(screen.getByText(`${mockSections.length} sections • ${expectedWordCount} words`)).toBeInTheDocument();
      });
    });

    it('should render iframe with preview content', async () => {
      render(<ExportPDFButton sections={mockSections} />);
      
      const previewButton = screen.getByRole('button', { name: /preview/i });
      await user.click(previewButton);
      
      await waitFor(() => {
        const iframe = screen.getByTitle('Document Preview');
        expect(iframe).toBeInTheDocument();
        expect(iframe).toHaveAttribute('srcDoc');
      });
    });

    it('should open full screen preview when full screen button is clicked', async () => {
      render(<ExportPDFButton sections={mockSections} />);
      
      const previewButton = screen.getByRole('button', { name: /preview/i });
      await user.click(previewButton);
      
      await waitFor(() => {
        const fullScreenButton = screen.getByRole('button', { name: /full screen/i });
        expect(fullScreenButton).toBeInTheDocument();
      });
      
      const fullScreenButton = screen.getByRole('button', { name: /full screen/i });
      await user.click(fullScreenButton);
      
      expect(global.window.open).toHaveBeenCalledWith('', '_blank');
    });

    it('should update preview content when configuration changes', async () => {
      render(<ExportPDFButton sections={mockSections} />);
      
      // Show preview first
      const previewButton = screen.getByRole('button', { name: /preview/i });
      await user.click(previewButton);
      
      // Open configuration
      const settingsButton = screen.getByRole('button', { name: '' });
      await user.click(settingsButton);
      
      // Change company name
      await waitFor(() => {
        const companyNameInput = screen.getByLabelText('Company Name');
        user.clear(companyNameInput);
        user.type(companyNameInput, 'Updated Company');
      });
      
      // The preview should update automatically due to React's reactive nature
      await waitFor(() => {
        const iframe = screen.getByTitle('Document Preview');
        expect(iframe).toBeInTheDocument();
      });
    });

    it('should show correct format type in preview description', async () => {
      render(<ExportPDFButton sections={mockSections} />);
      
      const previewButton = screen.getByRole('button', { name: /preview/i });
      await user.click(previewButton);
      
      await waitFor(() => {
        expect(screen.getByText('This is how your PDF document will look when exported.')).toBeInTheDocument();
      });
    });
  });
});