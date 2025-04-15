"use client";

import { Button } from "@/components/ui/button";
import { Package, Import } from "lucide-react";

export default function InventoryPage() {
  return (
    <div className="bg-muted h-full flex-1 p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground mt-1">Nothing to see here.</p>
        </div>
        <div className="flex items-center gap-x-2">
          <Button 
            variant="outline" 
            className="h-9 px-3 lg:px-4 text-sm font-medium"
          >
            <Import className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button 
            className="h-9 px-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium"
          >
            + Add product
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[400px] rounded-md border shadow-sm bg-white">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">No products</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get started by adding a new product
          </p>
          <Button 
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            + Add product
          </Button>
        </div>
      </div>
    </div>
  );
}
