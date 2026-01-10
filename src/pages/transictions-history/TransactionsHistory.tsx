import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchInput } from "@/components/common/SearchInput";
import { TransactionTable } from "./components/TransactionTable";
import { ViewTransactionDetailsModal } from "./components/ViewTransactionDetailsModal";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setFilters, setPage, setLimit } from "@/redux/slices/transactionSlice";
import { useUrlString, useUrlNumber } from "@/hooks/useUrlState";
import type { Transaction, TransactionStatus } from "@/types";

const STATUS_OPTIONS: { value: TransactionStatus | "all"; label: string }[] = [
  { value: "all", label: "All Status" },
  { value: "Pending", label: "Pending" },
  { value: "Completed", label: "Completed" },
  { value: "Failed", label: "Failed" },
  { value: "Cancelled", label: "Cancelled" },
];

export default function TransactionsHistory() {
  const dispatch = useAppDispatch();

  // Modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  // URL state management
  const [searchQuery, setSearchQuery] = useUrlString("search", "");
  const [statusFilter, setStatusFilter] = useUrlString("status", "all");
  const [currentPage, setCurrentPage] = useUrlNumber("page", 1);
  const [itemsPerPage, setItemsPerPage] = useUrlNumber("limit", 10);

  // Redux state
  const { filteredList, pagination } = useAppSelector(
    (state) => state.transactions
  );

  // Sync URL state with Redux filters
  useEffect(() => {
    dispatch(
      setFilters({
        search: searchQuery,
        status: statusFilter as TransactionStatus | "all",
      })
    );
  }, [searchQuery, statusFilter, dispatch]);

  // Sync URL pagination with Redux
  useEffect(() => {
    dispatch(setPage(currentPage));
  }, [currentPage, dispatch]);

  useEffect(() => {
    dispatch(setLimit(itemsPerPage));
  }, [itemsPerPage, dispatch]);

  // Pagination
  const totalPages = pagination.totalPages;
  const paginatedData = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    return filteredList.slice(startIndex, startIndex + pagination.limit);
  }, [filteredList, pagination.page, pagination.limit]);

  // Handlers
  const handleView = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsViewModalOpen(true);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (pagination.page > 3) pages.push("...");
      for (
        let i = Math.max(2, pagination.page - 1);
        i <= Math.min(totalPages - 1, pagination.page + 1);
        i++
      ) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (pagination.page < totalPages - 2) pages.push("...");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <CardTitle className="text-xl font-bold text-slate-800">
            Payment
          </CardTitle>
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search client name & car etc."
              className="w-[300px]"
            />

            {/* Filter Dropdown */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 bg-secondary hover:bg-secondary text-white border-secondary">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Table */}
          <TransactionTable transactions={paginatedData} onView={handleView} />

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Result Per Page</span>
              <Select
                value={String(itemsPerPage)}
                onValueChange={(val) => setItemsPerPage(Number(val))}
              >
                <SelectTrigger className="w-[70px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 25, 50, 100].map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, pagination.page - 1))}
                disabled={pagination.page === 1}
                className="text-gray-600"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Prev
              </Button>

              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) =>
                  typeof page === "number" ? (
                    <Button
                      key={index}
                      variant={pagination.page === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 ${
                        pagination.page === page
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "text-gray-600"
                      }`}
                    >
                      {page}
                    </Button>
                  ) : (
                    <span key={index} className="px-2 text-gray-400">
                      {page}
                    </span>
                  )
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, pagination.page + 1))
                }
                disabled={pagination.page === totalPages}
                className="text-gray-600"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
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
