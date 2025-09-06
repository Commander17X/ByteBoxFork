"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { DesktopContainer } from "@/components/ui/desktop-container";
import { ModelManagement } from "@/components/models/ModelManagement";
import { Button } from "@/components/ui/button";
import { Monitor, Cpu } from "lucide-react";

export default function DesktopPage() {
  const [activeTab, setActiveTab] = useState<"desktop" | "models">("desktop");

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />

      <main className="m-2 flex-1 overflow-hidden px-2 py-4">
        <div className="flex h-full gap-4">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="space-y-2">
              <Button
                variant={activeTab === "desktop" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setActiveTab("desktop")}
              >
                <Monitor className="w-4 h-4 mr-2" />
                Desktop View
              </Button>
              <Button
                variant={activeTab === "models" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setActiveTab("models")}
              >
                <Cpu className="w-4 h-4 mr-2" />
                Local Models
              </Button>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === "desktop" ? (
              <div className="flex h-full items-center justify-center">
                <div className="w-full max-w-4xl">
                  <DesktopContainer viewOnly={false} status="live_view">
                    {/* No action buttons for desktop page */}
                  </DesktopContainer>
                </div>
              </div>
            ) : (
              <div className="h-full overflow-y-auto">
                <ModelManagement />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
