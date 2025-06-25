
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Play } from "lucide-react";
import Editor from '@monaco-editor/react';

interface Problem {
  title: string;
  description: string;
  difficulty: string;
  test_cases: Array<{
    input: any;
    output: any;
    explanation: string;
  }>;
}

interface CodeEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  onSubmit: (results: Array<{case: number, passed: boolean, expected: string, actual: string}>) => void;
  submissions: number;
  problem: Problem;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onCodeChange,
  onSubmit,
  submissions,
  problem
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [isEvaluating, setIsEvaluating] = useState(false);

  const languageTemplates = {
    python: `# Write your solution here
def solve(nums):
    # Your code here
    pass

# Example usage:
# result = solve([1, 2, 3])
# print(result)`,
    cpp: `#include <iostream>
#include <vector>
using namespace std;

// Write your solution here
class Solution {
public:
    vector<int> solve(vector<int>& nums) {
        // Your code here
        return {};
    }
};

int main() {
    Solution sol;
    vector<int> nums = {1, 2, 3};
    vector<int> result = sol.solve(nums);
    return 0;
}`,
    java: `import java.util.*;

public class Solution {
    // Write your solution here
    public int[] solve(int[] nums) {
        // Your code here
        return new int[]{};
    }
    
    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] nums = {1, 2, 3};
        int[] result = sol.solve(nums);
    }
}`,
    c: `#include <stdio.h>
#include <stdlib.h>

// Write your solution here
int* solve(int* nums, int numsSize, int* returnSize) {
    // Your code here
    *returnSize = 0;
    return NULL;
}

int main() {
    int nums[] = {1, 2, 3};
    int returnSize;
    int* result = solve(nums, 3, &returnSize);
    return 0;
}`
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    onCodeChange(languageTemplates[language as keyof typeof languageTemplates]);
  };

  const simulateCodeExecution = (code: string, testCase: any) => {
    // This is a simplified simulation - in a real system, you'd execute the code in a sandbox
    try {
      // For Python-like syntax, try to extract and evaluate simple expressions
      if (selectedLanguage === 'python') {
        // Very basic simulation - check if code contains expected patterns
        const input = testCase.input;
        const expectedOutput = testCase.output;
        
        // Simple heuristic: if the code seems to handle the input type correctly
        if (Array.isArray(input) && code.includes('nums')) {
          // Simulate some basic operations
          if (code.includes('return') || code.includes('nums')) {
            // Random success rate for demonstration
            return Math.random() > 0.3 ? expectedOutput : input;
          }
        }
      }
      
      // For other languages, similar basic simulation
      return Math.random() > 0.4 ? testCase.output : "incorrect_output";
    } catch (error) {
      return "error";
    }
  };

  const handleSubmit = async () => {
    setIsEvaluating(true);
    
    // Simulate evaluation delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const results = problem.test_cases.map((testCase, index) => {
      const actualOutput = simulateCodeExecution(code, testCase);
      const expectedOutput = testCase.output;
      
      const passed = JSON.stringify(actualOutput) === JSON.stringify(expectedOutput);
      
      return {
        case: index + 1,
        passed,
        expected: JSON.stringify(expectedOutput),
        actual: JSON.stringify(actualOutput)
      };
    });
    
    setIsEvaluating(false);
    onSubmit(results);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <div className="space-y-4">
      {/* Problem Info */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-lg">{problem.title}</CardTitle>
            <Badge className={`${getDifficultyColor(problem.difficulty)} border`}>
              {problem.difficulty}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 text-sm leading-relaxed">
            {problem.description}
          </p>
        </CardContent>
      </Card>

      {/* Code Editor */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-white">
              <Zap className="h-5 w-5 mr-2 text-purple-400" />
              Code Editor
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="c">C</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="outline" className="text-cyan-400 border-cyan-400">
                Submissions: {submissions}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded border border-slate-600 overflow-hidden">
            <Editor
              height="400px"
              language={selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage}
              theme="vs-dark"
              value={code}
              onChange={(value) => onCodeChange(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on'
              }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Language: {selectedLanguage.toUpperCase()} | Lines: {code.split('\n').length}
            </div>
            <Button 
              onClick={handleSubmit}
              disabled={isEvaluating}
              className="bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600"
            >
              {isEvaluating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Evaluating...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Submit Code
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CodeEditor;
