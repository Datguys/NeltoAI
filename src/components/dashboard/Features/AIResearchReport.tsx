import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Bot } from "lucide-react";

export function AIResearchReport() {
  const [userDirection, setUserDirection] = useState("");
  const [report, setReport] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setReport("");

    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));

    const generatedReport = `
      <h3 class="text-lg font-semibold mb-2">Market Analysis Report</h3>
      <p class="mb-4">Based on your direction, here is a summary of the market analysis for a high-end coffee shop in Austin, TX.</p>
      <ul class="list-disc list-inside space-y-2">
        <li><strong>Target Audience:</strong> Young professionals and students aged 22-35 with disposable income.</li>
        <li><strong>Market Size:</strong> The specialty coffee market in Austin is valued at $150 million and is expected to grow by 8% annually.</li>
        <li><strong>Key Competitors:</strong> Major competitors include Starbucks, Summer Moon, and local artisanal coffee shops.</li>
        <li><strong>Trends:</strong> Increasing demand for sustainably sourced beans, alternative milk options, and unique cafe experiences.</li>
      </ul>
    `;

    setReport(generatedReport);
    setIsGenerating(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-blue-500" />
          AI Research + User Direction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="user-direction">User Direction</Label>
          <Textarea
            id="user-direction"
            placeholder="e.g., Focus on the target market for a high-end coffee shop in Austin, TX"
            value={userDirection}
            onChange={(e) => setUserDirection(e.target.value)}
            className="mt-1"
          />
        </div>
        <Button onClick={handleGenerateReport} disabled={isGenerating}>
          {isGenerating ? "Generating..." : "Generate Report"}
        </Button>
        {report && (
          <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
            <div dangerouslySetInnerHTML={{ __html: report }} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
