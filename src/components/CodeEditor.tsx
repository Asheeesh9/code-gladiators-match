
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Zap, Play } from "lucide-react";

interface CodeEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  onSubmit: () => void;
  submissions: number;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onCodeChange,
  onSubmit,
  submissions
}) => {
  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-white">
            <Zap className="h-5 w-5 mr-2 text-purple-400" />
            Code Editor
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
              Python
            </Badge>
            <Badge variant="outline" className="text-cyan-400 border-cyan-400">
              Submissions: {submissions}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          className="min-h-[300px] font-mono text-sm bg-slate-900/50 border-slate-600 text-white resize-none"
          placeholder="Write your solution here..."
        />
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Lines: {code.split('\n').length} | Characters: {code.length}
          </div>
          <Button 
            onClick={onSubmit}
            className="bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600"
          >
            <Play className="mr-2 h-4 w-4" />
            Submit Solution
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CodeEditor;
