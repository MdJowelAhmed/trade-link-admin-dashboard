import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { cn } from "@/utils/cn";
import type { Transaction, Refund, TransactionStatus } from "@/types";
import { useGetTransactionsQuery, useGetRefundTransactionsQuery } from "@/redux/api/transactionApi";

const STATUS_OPTIONS: { value: TransactionStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "SUCCESS", label: "Success" },
  { value: "REFUNDED", label: "Refunded" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
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

  // API queries
  const {
    data: transactionsData,
    isLoading: isLoadingTransactions,
    error: transactionsError,
  } = useGetTransactionsQuery({
    searchTerm: searchQuery || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    page: currentPage,
    limit: itemsPerPage,
  }, {
    skip: activeTab !== "transaction",
  });

  const {
    data: refundsData,
    isLoading: isLoadingRefunds,
    error: refundsError,
  } = useGetRefundTransactionsQuery({
    searchTerm: searchQuery || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    page: currentPage,
    limit: itemsPerPage,
  }, {
    skip: activeTab !== "refund",
  });

  // Get data based on active tab
  const allData: (Transaction | Refund)[] = useMemo(() => {
    if (activeTab === "transaction") {
      return transactionsData?.data || [];
    } else {
      return refundsData?.data || [];
    }
  }, [activeTab, transactionsData, refundsData]);

  // Get pagination info
  const pagination = useMemo(() => {
    if (activeTab === "transaction") {
      return transactionsData?.pagination;
    } else {
      return refundsData?.pagination;
    }
  }, [activeTab, transactionsData, refundsData]);

  const isLoading = activeTab === "transaction" ? isLoadingTransactions : isLoadingRefunds;
  const error = activeTab === "transaction" ? transactionsError : refundsError;

  // Pagination
  const totalPages = pagination?.totalPage || 1;
  const totalItems = pagination?.total || 0;

  // Handlers
  const handleView = (transaction: Transaction | Refund) => {
    setSelectedTransaction(transaction);
    setIsViewModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = () => {
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

        <CardHeader>
          <div className="flex flex-row items-center justify-between ">
            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => handleTabChange("transaction")}
                className={cn(
                  "px-6 py-3 rounded-full text-sm font-medium transition-colors",
                  activeTab === "transaction"
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                )}
              >
                Transaction
              </button>
              <button
                onClick={() => handleTabChange("refund")}
                className={cn(
                  "px-6 py-3 rounded-full text-sm font-medium transition-colors",
                  activeTab === "refund"
                    ? "bg-primary text-white"
                    : "bg-card text-gray-700 hover:bg-gray-300"
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
                <SelectTrigger className="w-32 bg-card border-gray-300">
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
        </CardHeader>

        <CardContent className="p-0">
          {/* Header with Tabs and Filters */}


          {/* Table */}
          {isLoading ? (
            <div className="px-6 py-8 text-center text-gray-500">
              Loading...
            </div>
          ) : error ? (
            <div className="px-6 py-8 text-center text-red-500">
              Error loading data. Please try again.
            </div>
          ) : (
            <>
              <TransactionTable
                transactions={allData}
                onView={handleView}
                startIndex={(currentPage - 1) * itemsPerPage}
              />

              {/* Pagination */}
              <div className="mt-4 pt-4 border-t border-gray-100 px-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </div>
            </>
          )}
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
