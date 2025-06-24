
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code } from "lucide-react";
import TestResults from './TestResults';

interface Problem {
  title: string;
  description: string;
  test_cases: Array<{
    input: any;
    output: any;
    explanation: string;
  }>;
}

interface TestResult {
  case: number;
  passed: boolean;
  expected: string;
  actual: string;
}

interface ProblemStatementProps {
  problem: Problem;
  testResults: TestResult[];
}

const ProblemStatement: React.FC<ProblemStatementProps> = ({ problem, testResults }) => {
  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Code className="h-5 w-5 mr-2 text-cyan-400" />
          {problem.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-300 leading-relaxed">
          {problem.description}
        </p>
        
        <div>
          <h4 className="font-semibold text-white mb-2">Examples:</h4>
          <div className="space-y-3">
            {problem.test_cases.slice(0, 2).map((testCase, idx) => (
              <div key={idx} className="bg-slate-900/50 p-3 rounded border border-slate-600">
                <div className="text-sm font-mono space-y-1">
                  <div><span className="text-cyan-400">Input:</span> <span className="text-gray-300">{JSON.stringify(testCase.input)}</span></div>
                  <div><span className="text-green-400">Output:</span> <span className="text-gray-300">{JSON.stringify(testCase.output)}</span></div>
                  <div className="text-gray-400 text-xs mt-2">{testCase.explanation}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {testResults.length > 0 && (
          <TestResults testResults={testResults} />
        )}
      </CardContent>
    </Card>
  );
};

export default ProblemStatement;
