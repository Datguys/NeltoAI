import React, { useState } from 'react';
import { PDFDownloadLink, Document, Page, Text, StyleSheet, Font, View } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, Settings, Palette, Building, Eye, Maximize2, Info, List } from 'lucide-react';

// Register fonts for better PDF quality
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v3/UcCO3Fwr-0vN3tTlo8JKzw.ttf' },
    { src: 'https://fonts.gstatic.com/s/inter/v3/UcCO3Fwr-0vN3tTlo8JKzw.ttf', fontWeight: 'bold' },
  ]
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Inter',
    fontSize: 11,
    padding: 40,
    backgroundColor: '#fff',
    lineHeight: 1.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#7c3aed',
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7c3aed',
  },
  reportTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#1f2937',
  },
  date: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 30,
    color: '#6b7280',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#7c3aed',
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  content: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 8,
    textAlign: 'justify',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#9ca3af',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  tocTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1f2937',
  },
  tocItem: {
    fontSize: 11,
    marginBottom: 5,
    color: '#4b5563',
  },
});

export interface ExportSection {
  id: string;
  title: string;
  content: string;
  category?: 'business-plan' | 'analysis' | 'financial' | 'market';
  wordCount?: number;
}

export interface ExportOptions {
  includeTOC: boolean;
  includeHeader: boolean;
  includeFooter: boolean;
  companyName: string;
  reportTitle: string;
  selectedSections: string[];
  format: 'pdf' | 'html' | 'json';
  template: 'professional' | 'modern' | 'minimal';
}

interface ExportPDFButtonProps {
  sections: ExportSection[];
  fileName?: string;
  defaultCompanyName?: string;
  defaultReportTitle?: string;
}

export function ExportPDFButton({ 
  sections, 
  fileName = 'report.pdf',
  defaultCompanyName = 'My Company',
  defaultReportTitle = 'Business Report'
}: ExportPDFButtonProps) {
  const [options, setOptions] = useState<ExportOptions>({
    includeTOC: true,
    includeHeader: true,
    includeFooter: true,
    companyName: defaultCompanyName,
    reportTitle: defaultReportTitle,
    selectedSections: sections.map(s => s.id),
    format: 'pdf',
    template: 'professional'
  });

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showAllInfo, setShowAllInfo] = useState(false);

  const selectedSections = sections.filter(s => options.selectedSections.includes(s.id));
  const totalWordCount = selectedSections.reduce((sum, section) => sum + (section.wordCount || 0), 0);

  const createPDFDocument = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        {options.includeHeader && (
          <View style={styles.header}>
            <Text style={styles.companyName}>{options.companyName}</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
          </View>
        )}

        {/* Title */}
        <Text style={styles.reportTitle}>{options.reportTitle}</Text>

        {/* Table of Contents */}
        {options.includeTOC && selectedSections.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.tocTitle}>Table of Contents</Text>
            {selectedSections.map((section, index) => (
              <Text key={section.id} style={styles.tocItem}>
                {index + 1}. {section.title}
              </Text>
            ))}
            <Text style={{ marginTop: 15, marginBottom: 15 }}>────────────────────────</Text>
          </View>
        )}

        {/* Sections */}
        {selectedSections.map((section, index) => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionTitle}>
              {selectedSections.length > 1 ? `${index + 1}. ` : ''}{section.title}
            </Text>
            <Text style={styles.content}>
              {section.content.replace(/\n\n/g, '\n').trim()}
            </Text>
          </View>
        ))}

        {/* Footer */}
        {options.includeFooter && (
          <Text style={styles.footer}>
            Generated by Founder Launch Platform • {new Date().toLocaleDateString()} • {totalWordCount} words
          </Text>
        )}
      </Page>
    </Document>
  );

  const exportToHTML = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${options.reportTitle}</title>
        <style>
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #374151; max-width: 800px; margin: 0 auto; padding: 40px 20px; }
          .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #7c3aed; }
          .company-name { font-size: 1.25rem; font-weight: bold; color: #7c3aed; }
          .report-title { font-size: 2rem; font-weight: bold; text-align: center; margin-bottom: 10px; color: #1f2937; }
          .date { text-align: center; margin-bottom: 40px; color: #6b7280; }
          .toc { margin-bottom: 40px; }
          .toc-title { font-size: 1.5rem; font-weight: bold; margin-bottom: 20px; color: #1f2937; }
          .toc-item { margin-bottom: 8px; color: #4b5563; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 1.25rem; font-weight: bold; margin-bottom: 15px; color: #7c3aed; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; }
          .content { text-align: justify; white-space: pre-line; }
          .footer { text-align: center; margin-top: 60px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 0.875rem; color: #9ca3af; }
        </style>
      </head>
      <body>
        ${options.includeHeader ? `
          <div class="header">
            <div class="company-name">${options.companyName}</div>
            <div>${new Date().toLocaleDateString()}</div>
          </div>
        ` : ''}
        
        <h1 class="report-title">${options.reportTitle}</h1>
        
        ${options.includeTOC && selectedSections.length > 1 ? `
          <div class="toc">
            <h2 class="toc-title">Table of Contents</h2>
            ${selectedSections.map((section, index) => `
              <div class="toc-item">${index + 1}. ${section.title}</div>
            `).join('')}
          </div>
        ` : ''}
        
        ${selectedSections.map((section, index) => `
          <div class="section">
            <h2 class="section-title">${selectedSections.length > 1 ? `${index + 1}. ` : ''}${section.title}</h2>
            <div class="content">${section.content}</div>
          </div>
        `).join('')}
        
        ${options.includeFooter ? `
          <div class="footer">
            Generated by Founder Launch Platform • ${new Date().toLocaleDateString()} • ${totalWordCount} words
          </div>
        ` : ''}
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace('.pdf', '.html');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const jsonData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        companyName: options.companyName,
        reportTitle: options.reportTitle,
        totalSections: selectedSections.length,
        totalWordCount: totalWordCount,
        options: options
      },
      sections: selectedSections.map(section => ({
        id: section.id,
        title: section.title,
        content: section.content,
        category: section.category || 'general',
        wordCount: section.wordCount || section.content.split(' ').length
      }))
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace('.pdf', '.json');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generatePreviewHTML = () => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${options.reportTitle}</title>
        <style>
          body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
            line-height: 1.6; 
            color: #374151; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 40px 20px; 
            background: #fff;
          }
          .header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 40px; 
            padding-bottom: 20px; 
            border-bottom: 2px solid #7c3aed; 
          }
          .company-name { 
            font-size: 1.25rem; 
            font-weight: bold; 
            color: #7c3aed; 
          }
          .report-title { 
            font-size: 2rem; 
            font-weight: bold; 
            text-align: center; 
            margin-bottom: 10px; 
            color: #1f2937; 
          }
          .date { 
            text-align: center; 
            margin-bottom: 40px; 
            color: #6b7280; 
          }
          .toc { 
            margin-bottom: 40px; 
          }
          .toc-title { 
            font-size: 1.5rem; 
            font-weight: bold; 
            margin-bottom: 20px; 
            color: #1f2937; 
          }
          .toc-item { 
            margin-bottom: 8px; 
            color: #4b5563; 
          }
          .section { 
            margin-bottom: 30px; 
            page-break-inside: avoid;
            position: relative;
          }
          .section-title { 
            font-size: 1.25rem; 
            font-weight: bold; 
            margin-bottom: 15px; 
            color: #7c3aed; 
            padding-bottom: 8px; 
            border-bottom: 1px solid #e5e7eb;
            position: relative;
          }
          .section-number {
            position: absolute;
            left: -40px;
            top: 0;
            color: #9ca3af;
            font-size: 0.875rem;
            font-weight: normal;
          }
          .content { 
            text-align: justify; 
            white-space: pre-line;
            line-height: 1.7;
            margin-left: 0;
            position: relative;
          }
          .subsection {
            margin: 15px 0;
            padding-left: 20px;
            border-left: 3px solid #e5e7eb;
          }
          .subsection-title {
            font-weight: 600;
            color: #4b5563;
            margin-bottom: 8px;
          }
          .footer { 
            text-align: center; 
            margin-top: 60px; 
            padding-top: 20px; 
            border-top: 1px solid #e5e7eb; 
            font-size: 0.875rem; 
            color: #9ca3af; 
          }
        </style>
      </head>
      <body>
        ${options.includeHeader ? `
          <div class="header">
            <div class="company-name">${options.companyName}</div>
            <div>${new Date().toLocaleDateString()}</div>
          </div>
        ` : ''}
        
        <h1 class="report-title">${options.reportTitle}</h1>
        
        ${options.includeTOC && selectedSections.length > 1 ? `
          <div class="toc">
            <h2 class="toc-title">Table of Contents</h2>
            ${selectedSections.map((section, index) => `
              <div class="toc-item">${index + 1}. ${section.title}</div>
            `).join('')}
          </div>
        ` : ''}
        
        ${selectedSections.map((section, index) => `
          <div class="section">
            <h2 class="section-title">${selectedSections.length > 1 ? `${index + 1}. ` : ''}${section.title}</h2>
            <div class="content">${section.content}</div>
          </div>
        `).join('')}
        
        ${options.includeFooter ? `
          <div class="footer">
            Generated by Founder Launch Platform • ${new Date().toLocaleDateString()} • ${totalWordCount} words
          </div>
        ` : ''}
      </body>
      </html>
    `;
  };

  const handleExport = () => {
    switch (options.format) {
      case 'html':
        exportToHTML();
        break;
      case 'json':
        exportToJSON();
        break;
      default:
        // PDF download is handled by PDFDownloadLink
        break;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
      {/* Quick Export Button */}
      {options.format === 'pdf' ? (
        <PDFDownloadLink 
          document={createPDFDocument()} 
          fileName={fileName}
          className="inline-block"
        >
          {({ loading }) => (
            <Button disabled={loading || selectedSections.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              {loading ? 'Preparing...' : 'Export PDF'}
            </Button>
          )}
        </PDFDownloadLink>
      ) : (
        <Button 
          onClick={handleExport} 
          disabled={selectedSections.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          Export {options.format.toUpperCase()}
        </Button>
      )}

      {/* Preview Button */}
      <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
        <Eye className="w-4 h-4 mr-2" />
        {showPreview ? 'Hide Preview' : 'Preview'}
      </Button>

      {/* Show All Information Button */}
      <Button variant="outline" size="sm" onClick={() => setShowAllInfo(!showAllInfo)}>
        <Info className="w-4 h-4 mr-2" />
        {showAllInfo ? 'Hide Info' : 'Show All'}
      </Button>

      {/* Export Configuration Dialog */}
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Export Configuration
            </DialogTitle>
            <DialogDescription>
              Customize your export settings and select which sections to include.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Format Selection */}
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select value={options.format} onValueChange={(value: any) => setOptions({...options, format: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="html">HTML Page</SelectItem>
                  <SelectItem value="json">JSON Data</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Basic Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Document Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <input
                      id="companyName"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={options.companyName}
                      onChange={(e) => setOptions({...options, companyName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reportTitle">Report Title</Label>
                    <input
                      id="reportTitle"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={options.reportTitle}
                      onChange={(e) => setOptions({...options, reportTitle: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Layout Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Layout Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeTOC" 
                    checked={options.includeTOC}
                    onCheckedChange={(checked) => setOptions({...options, includeTOC: !!checked})}
                  />
                  <Label htmlFor="includeTOC">Include Table of Contents</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeHeader" 
                    checked={options.includeHeader}
                    onCheckedChange={(checked) => setOptions({...options, includeHeader: !!checked})}
                  />
                  <Label htmlFor="includeHeader">Include Header</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeFooter" 
                    checked={options.includeFooter}
                    onCheckedChange={(checked) => setOptions({...options, includeFooter: !!checked})}
                  />
                  <Label htmlFor="includeFooter">Include Footer</Label>
                </div>
              </CardContent>
            </Card>

            {/* Section Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Select Sections ({options.selectedSections.length}/{sections.length})
                </CardTitle>
                <CardDescription>
                  Choose which sections to include in your export
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {sections.map((section) => (
                    <div key={section.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={section.id}
                        checked={options.selectedSections.includes(section.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setOptions({
                              ...options,
                              selectedSections: [...options.selectedSections, section.id]
                            });
                          } else {
                            setOptions({
                              ...options,
                              selectedSections: options.selectedSections.filter(id => id !== section.id)
                            });
                          }
                        }}
                      />
                      <Label htmlFor={section.id} className="text-sm flex-1">
                        {section.title}
                      </Label>
                      {section.category && (
                        <Badge variant="secondary" className="text-xs">
                          {section.category}
                        </Badge>
                      )}
                      {section.wordCount && (
                        <span className="text-xs text-muted-foreground">
                          {section.wordCount} words
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Selected sections: {options.selectedSections.length}</span>
                    <span>Total words: {totalWordCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export Actions */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setIsConfigOpen(false)}>
                Cancel
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setOptions({...options, selectedSections: sections.map(s => s.id)})}
                >
                  Select All
                </Button>
                {options.format === 'pdf' ? (
                  <PDFDownloadLink 
                    document={createPDFDocument()} 
                    fileName={fileName}
                    className="inline-block"
                  >
                    {({ loading }) => (
                      <Button disabled={loading || selectedSections.length === 0}>
                        <Download className="w-4 h-4 mr-2" />
                        {loading ? 'Preparing...' : 'Export PDF'}
                      </Button>
                    )}
                  </PDFDownloadLink>
                ) : (
                  <Button 
                    onClick={() => {
                      handleExport();
                      setIsConfigOpen(false);
                    }}
                    disabled={selectedSections.length === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export {options.format.toUpperCase()}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>

      {/* Preview Section */}
      {showPreview && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Document Preview
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {selectedSections.length} sections • {totalWordCount} words
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const previewWindow = window.open('', '_blank');
                    if (previewWindow) {
                      previewWindow.document.write(generatePreviewHTML());
                      previewWindow.document.close();
                    }
                  }}
                >
                  <Maximize2 className="w-4 h-4 mr-2" />
                  Full Screen
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              This is how your {options.format.toUpperCase()} document will look when exported.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg bg-white">
              <iframe
                srcDoc={generatePreviewHTML()}
                className="w-full h-96 border-0 rounded-lg"
                title="Document Preview"
                style={{ 
                  minHeight: '600px',
                  backgroundColor: 'white'
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Show All Information Panel */}
      {showAllInfo && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <List className="w-5 h-5" />
              Complete Document Information
            </CardTitle>
            <CardDescription>
              Detailed breakdown of all sections, content, and export configuration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Export Configuration Summary */}
            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Building className="w-4 h-4" />
                Export Configuration
              </h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><span className="font-medium">Company:</span> {options.companyName}</p>
                  <p><span className="font-medium">Title:</span> {options.reportTitle}</p>
                  <p><span className="font-medium">Format:</span> {options.format.toUpperCase()}</p>
                </div>
                <div>
                  <p><span className="font-medium">Header:</span> {options.includeHeader ? 'Yes' : 'No'}</p>
                  <p><span className="font-medium">Footer:</span> {options.includeFooter ? 'Yes' : 'No'}</p>
                  <p><span className="font-medium">Table of Contents:</span> {options.includeTOC ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>

            {/* Section Details */}
            <div>
              <h4 className="font-semibold mb-3">Section Breakdown ({selectedSections.length} of {sections.length} selected)</h4>
              <div className="space-y-3">
                {sections.map((section, index) => {
                  const isSelected = options.selectedSections.includes(section.id);
                  return (
                    <div 
                      key={section.id} 
                      className={`border rounded-lg p-4 ${isSelected ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-muted'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-mono text-muted-foreground">
                              #{index + 1}
                            </span>
                            <h5 className="font-medium">{section.title}</h5>
                            {section.category && (
                              <Badge variant="secondary" className="text-xs">
                                {section.category}
                              </Badge>
                            )}
                            {!isSelected && (
                              <Badge variant="outline" className="text-xs text-muted-foreground">
                                Not Selected
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-sm text-muted-foreground mb-2">
                            <span className="font-medium">Word Count:</span> {section.wordCount || 'N/A'} words
                          </div>
                          
                          <div className="text-sm">
                            <span className="font-medium">Preview:</span>
                            <p className="mt-1 text-muted-foreground">
                              {section.content.substring(0, 150)}
                              {section.content.length > 150 && '...'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Statistics */}
            <div className="border rounded-lg p-4 bg-primary/5">
              <h4 className="font-semibold mb-3">Document Statistics</h4>
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">{selectedSections.length}</div>
                  <div className="text-muted-foreground">Selected Sections</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">{totalWordCount.toLocaleString()}</div>
                  <div className="text-muted-foreground">Total Words</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">
                    {Math.ceil(totalWordCount / 250)}
                  </div>
                  <div className="text-muted-foreground">Est. Pages</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">
                    {Math.ceil(totalWordCount / 200)}
                  </div>
                  <div className="text-muted-foreground">Read Time (min)</div>
                </div>
              </div>
            </div>

            {/* Export Actions */}
            <div className="flex justify-center">
              {options.format === 'pdf' ? (
                <PDFDownloadLink 
                  document={createPDFDocument()} 
                  fileName={fileName}
                  className="inline-block"
                >
                  {({ loading }) => (
                    <Button disabled={loading || selectedSections.length === 0} size="lg">
                      <Download className="w-4 h-4 mr-2" />
                      {loading ? 'Preparing...' : 'Export Complete Document'}
                    </Button>
                  )}
                </PDFDownloadLink>
              ) : (
                <Button 
                  onClick={handleExport} 
                  disabled={selectedSections.length === 0}
                  size="lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Complete Document ({options.format.toUpperCase()})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
