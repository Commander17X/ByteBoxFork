"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Download, Trash2, RefreshCw, CheckCircle, XCircle } from "lucide-react";

interface Model {
  name: string;
  size?: number;
  modified_at?: string;
}

interface ModelManagementProps {
  className?: string;
}

const POPULAR_MODELS = [
  { name: "llama3.2:3b", description: "Small, fast model (3B parameters)" },
  { name: "llama3.2:1b", description: "Very small, very fast model (1B parameters)" },
  { name: "llama3.1:8b", description: "Medium model (8B parameters)" },
  { name: "qwen2.5:3b", description: "Alternative small model (3B parameters)" },
  { name: "phi3:mini", description: "Microsoft's small model (3.8B parameters)" },
  { name: "llama3.2:70b", description: "Large model (70B parameters) - requires significant resources" },
];

export function ModelManagement({ className }: ModelManagementProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(false);
  const [pulling, setPulling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [customModel, setCustomModel] = useState("");
  const [ollamaStatus, setOllamaStatus] = useState<boolean | null>(null);

  useEffect(() => {
    fetchModels();
    checkOllamaStatus();
  }, []);

  const checkOllamaStatus = async () => {
    try {
      const response = await fetch("http://localhost:11434/api/tags");
      setOllamaStatus(response.ok);
    } catch (error) {
      setOllamaStatus(false);
    }
  };

  const fetchModels = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:11434/api/tags");
      if (response.ok) {
        const data = await response.json();
        setModels(data.models || []);
      }
    } catch (error) {
      console.error("Failed to fetch models:", error);
    } finally {
      setLoading(false);
    }
  };

  const pullModel = async (modelName: string) => {
    setPulling(modelName);
    try {
      const response = await fetch("http://localhost:11434/api/pull", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: modelName }),
      });

      if (response.ok) {
        // Stream the response to show progress
        const reader = response.body?.getReader();
        if (reader) {
          const decoder = new TextDecoder();
          let done = false;

          while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;

            if (value) {
              const chunk = decoder.decode(value);
              const lines = chunk.split('\n');
              
              for (const line of lines) {
                if (line.trim()) {
                  try {
                    const data = JSON.parse(line);
                    if (data.status) {
                      console.log(`Model pull status: ${data.status}`);
                    }
                  } catch (e) {
                    // Ignore non-JSON lines
                  }
                }
              }
            }
          }
        }
        await fetchModels();
      } else {
        console.error("Failed to pull model");
      }
    } catch (error) {
      console.error("Error pulling model:", error);
    } finally {
      setPulling(null);
    }
  };

  const deleteModel = async (modelName: string) => {
    setDeleting(modelName);
    try {
      const response = await fetch(`http://localhost:11434/api/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: modelName }),
      });

      if (response.ok) {
        await fetchModels();
      } else {
        console.error("Failed to delete model");
      }
    } catch (error) {
      console.error("Error deleting model:", error);
    } finally {
      setDeleting(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Local LLM Models</CardTitle>
              <CardDescription>
                Manage local language models running on Ollama
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={ollamaStatus ? "default" : "destructive"}>
                {ollamaStatus ? (
                  <><CheckCircle className="w-3 h-3 mr-1" /> Ollama Running</>
                ) : (
                  <><XCircle className="w-3 h-3 mr-1" /> Ollama Offline</>
                )}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchModels}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Install Popular Models */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Install Popular Models</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {POPULAR_MODELS.map((model) => (
                <div
                  key={model.name}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{model.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {model.description}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => pullModel(model.name)}
                    disabled={pulling === model.name || models.some(m => m.name === model.name)}
                  >
                    {pulling === model.name ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : models.some(m => m.name === model.name) ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Model Installation */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Install Custom Model</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Enter model name (e.g., llama3.2:latest)"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={() => {
                  if (customModel.trim()) {
                    pullModel(customModel.trim());
                    setCustomModel("");
                  }
                }}
                disabled={!customModel.trim() || pulling !== null}
              >
                {pulling === customModel ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Installed Models */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Installed Models ({models.length})
            </h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : models.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No models installed. Install a model above to get started.
              </div>
            ) : (
              <div className="space-y-2">
                {models.map((model) => (
                  <div
                    key={model.name}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{model.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {model.size && `Size: ${formatFileSize(model.size)}`}
                        {model.modified_at && ` • Modified: ${formatDate(model.modified_at)}`}
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteModel(model.name)}
                      disabled={deleting === model.name}
                    >
                      {deleting === model.name ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
