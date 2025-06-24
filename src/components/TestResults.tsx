
import React from 'react';
import { CheckCircle, XCircle } from "lucide-react";

interface TestResult {
  case: number;
  passed: boolean;
  expected: string;
  actual: string;
}

interface TestResultsProps {
  testResults: TestResult[];
}

const TestResults: React.FC<TestResultsProps> = ({ testResults }) => {
  return (
    <div>
      <h4 className="font-semibold text-white mb-2">Test Results:</h4>
      <div className="space-y-2">
        {testResults.map((result, idx) => (
          <div key={idx} className={`flex items-center justify-between p-2 rounded text-sm ${
            result.passed ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'
          }`}>
            <div className="flex items-center">
              {result.passed ? 
                <CheckCircle className="h-4 w-4 text-green-400 mr-2" /> :
                <XCircle className="h-4 w-4 text-red-400 mr-2" />
              }
              <span className="text-white">Test Case {result.case}</span>
            </div>
            <span className={result.passed ? 'text-green-400' : 'text-red-400'}>
              {result.passed ? 'PASS' : 'FAIL'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestResults;
