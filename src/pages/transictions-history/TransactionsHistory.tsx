import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchInput } from "@/components/common/SearchInput";
import { Pagination } from "@/components/common/Pagination";
import { TransactionTable } from "./components/TransactionTable";
import { ViewTransactionDetailsModal } from "./components/ViewTransactionDetailsModal";
import { mockTransactions, mockRefunds } from "./transactionData";
import { cn } from "@/utils/cn";
import type { Transaction, Refund, TransactionStatus } from "@/types";

const STATUS_OPTIONS: { value: TransactionStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "Pending", label: "Pending" },
  { value: "Completed", label: "Completed" },
  { value: "Failed", label: "Failed" },
  { value: "Cancelled", label: "Cancelled" },
];

type TabType = "transaction" | "refund";

export default function TransactionsHistory() {
  const [activeTab, setActiveTab] = useState<TabType>("transaction");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | Refund | null>(null);

  // Get data based on active tab
  const allData = useMemo(() => {
    return activeTab === "transaction" ? mockTransactions : mockRefunds;
  }, [activeTab]);

  // Filter data
  const filteredData = useMemo(() => {
    let filtered = allData;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.userName.toLowerCase().includes(query) ||
          item.leadId.toLowerCase().includes(query) ||
          item.service.toLowerCase().includes(query) ||
          item.email.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    return filtered;
  }, [allData, searchQuery, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Handlers
  const handleView = (transaction: Transaction | Refund) => {
    setSelectedTransaction(transaction);
    setIsViewModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (limit: number) => {
    // Reset to page 1 when changing items per page
    setCurrentPage(1);
  };

  // Reset to page 1 when changing tabs or filters
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="p-6">
          {/* Header with Tabs and Filters */}
          <div className="flex flex-row items-center justify-between mb-6">
            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => handleTabChange("transaction")}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium transition-colors",
                  activeTab === "transaction"
                    ? "bg-[#1E40AF] text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                )}
              >
                Transaction
              </button>
              <button
                onClick={() => handleTabChange("refund")}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium transition-colors",
                  activeTab === "refund"
                    ? "bg-[#1E40AF] text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                )}
              >
                Refund
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center gap-3">
              {/* Filter Dropdown */}
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value as TransactionStatus | "all");
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-32 bg-white border-gray-300">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Search Input */}
              <SearchInput
                value={searchQuery}
                onChange={(value) => {
                  setSearchQuery(value);
                  setCurrentPage(1);
                }}
                placeholder="Search here"
                className="w-[250px]"
              />
            </div>
          </div>

          {/* Table */}
          <TransactionTable
            transactions={paginatedData}
            onView={handleView}
            startIndex={(currentPage - 1) * itemsPerPage}
          />

          {/* Pagination */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredData.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* View Transaction Details Modal */}
      <ViewTransactionDetailsModal
        open={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
      />
    </motion.div>
  );
}
