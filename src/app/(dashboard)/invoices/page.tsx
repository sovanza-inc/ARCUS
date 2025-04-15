"use client";

import { useState, useEffect } from "react";
import { Filter, ChevronDown, Pencil, Download, Copy, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateInvoice } from "./create-invoice";
import { EditInvoice } from "./edit-invoice";

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  status: "Pending" | "Paid" | "Cancelled" | "Refunded";
  createdAt: string;
  updatedAt: string;
}

export default function InvoicesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "All Statuses",
    client: "",
  });

  const loadInvoices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/invoices");
      if (!response.ok) throw new Error("Failed to fetch invoices");
      const data = await response.json();
      setInvoices(data);
      setFilteredInvoices(data);
    } catch (error) {
      console.error("Failed to load invoices:", error);
      toast.error("Failed to load invoices");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  // Apply filters whenever filters or invoices change
  useEffect(() => {
    let result = [...invoices];

    // Apply status filter
    if (filters.status !== "All Statuses") {
      result = result.filter(invoice => invoice.status === filters.status);
    }

    // Apply client filter
    if (filters.client) {
      const searchTerm = filters.client.toLowerCase();
      result = result.filter(
        invoice => 
          invoice.clientName.toLowerCase().includes(searchTerm) ||
          invoice.clientEmail.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredInvoices(result);
  }, [filters, invoices]);

  const handleEdit = async (invoice: Invoice) => {
    setEditingInvoice(invoice);
  };

  const handleDownload = async (invoice: Invoice) => {
    try {
      const response = await fetch(`/api/invoices/${invoice.id}`);
      if (!response.ok) throw new Error("Failed to download invoice");
      
      const data = await response.json();
      
      // Create a Blob from the data
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice.invoiceNumber}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Invoice downloaded successfully");
    } catch (error) {
      console.error("Failed to download invoice:", error);
      toast.error("Failed to download invoice");
    }
  };

  const handleDuplicate = async (invoice: Invoice) => {
    try {
      const response = await fetch('/api/invoices/duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: invoice.id }),
      });

      if (!response.ok) throw new Error("Failed to duplicate invoice");
      
      await loadInvoices();
      toast.success("Invoice duplicated successfully");
    } catch (error) {
      console.error("Failed to duplicate invoice:", error);
      toast.error("Failed to duplicate invoice");
    }
  };

  const handleDelete = async (invoice: Invoice) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) {
      return;
    }

    try {
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error("Failed to delete invoice");
      
      await loadInvoices();
      toast.success("Invoice deleted successfully");
    } catch (error) {
      console.error("Failed to delete invoice:", error);
      toast.error("Failed to delete invoice");
    }
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const clearFilters = () => {
    setFilters({
      status: "All Statuses",
      client: "",
    });
  };

  return (
    <div className="bg-muted h-full flex-1 p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
        <div className="flex items-center gap-x-2">
          <Button 
            variant={showFilters ? "default" : "outline"}
            className={`h-9 px-3 lg:px-4 text-sm font-medium ${showFilters ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="h-9 px-4 bg-orange-500 hover:bg-orange-600 text-sm font-medium"
          >
            + Create invoice
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-md border p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Filters</h2>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
            >
              <X className="h-4 w-4 mr-1" />
              Clear filters
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500"
              >
                <option>All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client
              </label>
              <input
                type="text"
                value={filters.client}
                onChange={(e) => setFilters(prev => ({ ...prev, client: e.target.value }))}
                placeholder="Search by name or email"
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500"
              />
            </div>
          </div>
        </div>
      )}

      <div className="rounded-md border shadow-sm bg-white">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-medium">
                <div className="flex items-center">
                  Invoice
                  <ChevronDown className="h-4 w-4 ml-1 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead className="font-medium">
                <div className="flex items-center">
                  Date
                  <ChevronDown className="h-4 w-4 ml-1 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead className="font-medium">
                <div className="flex items-center">
                  Status
                  <ChevronDown className="h-4 w-4 ml-1 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead className="font-medium">
                <div className="flex items-center">
                  Client
                  <ChevronDown className="h-4 w-4 ml-1 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead className="font-medium text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Loading invoices...
                </TableCell>
              </TableRow>
            ) : filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {invoices.length === 0 ? (
                    "No invoices found. Create your first invoice!"
                  ) : (
                    "No invoices match your filters."
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className={`h-2 w-2 rounded-full ${
                        invoice.status === "Paid" ? "bg-emerald-500" :
                        invoice.status === "Cancelled" ? "bg-red-500" :
                        invoice.status === "Refunded" ? "bg-purple-500" :
                        "bg-yellow-500"
                      } mr-2`} />
                      <span className="text-sm">{invoice.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{invoice.clientName}</div>
                      <div className="text-sm text-muted-foreground">
                        {invoice.clientEmail}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-x-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleEdit(invoice)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleDownload(invoice)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleDuplicate(invoice)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleDelete(invoice)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            Page 1 of 1
          </div>
          <div className="flex items-center space-x-6">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-4"
              disabled
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-4"
              disabled
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <CreateInvoice
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={() => {
          loadInvoices();
          setIsCreateOpen(false);
        }}
      />

      <EditInvoice
        invoice={editingInvoice}
        open={!!editingInvoice}
        onOpenChange={(open) => {
          if (!open) setEditingInvoice(null);
        }}
        onSuccess={() => {
          loadInvoices();
          setEditingInvoice(null);
        }}
      />
    </div>
  );
}
