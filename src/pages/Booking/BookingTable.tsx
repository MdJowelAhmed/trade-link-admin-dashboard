import { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Filter,
  Plus,
  RefreshCw,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { statusFilterOptions } from "./bookingData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUrlString, useUrlNumber } from "@/hooks/useUrlState";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  setFilters,
  setPage,
  setLimit,
  updateBookingStatus,
} from "@/redux/slices/bookingSlice";
import { SearchInput } from "@/components/common/SearchInput";
import { useToast } from "@/components/ui/use-toast";
import type { BookingStatus } from "@/types";

export function BookingTable() {
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  // URL state management
  const [searchQuery, setSearchQuery] = useUrlString("search", "");
  const [statusFilter, setStatusFilter] = useUrlString("status", "all");
  const [currentPage, setCurrentPage] = useUrlNumber("page", 1);
  const [itemsPerPage, setItemsPerPage] = useUrlNumber("limit", 10);

  // Redux state
  const { filteredList, pagination, filters } = useAppSelector(
    (state) => state.bookings
  );

  // Sync URL state with Redux filters
  useEffect(() => {
    dispatch(
      setFilters({
        search: searchQuery,
        status: statusFilter as BookingStatus | "all",
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

  const handleStatusUpdate = (bookingId: string, newStatus: BookingStatus) => {
    dispatch(updateBookingStatus({ id: bookingId, status: newStatus }));
    toast({
      title: "Status Updated",
      description: `Booking status changed to ${newStatus}`,
    });
  };

  const getStatusButton = (status: string, bookingId: string) => {
    const statusOptions: {
      value: BookingStatus;
      label: string;
      icon: typeof CheckCircle;
    }[] = [
      { value: "Upcoming", label: "Upcoming", icon: Calendar },
      { value: "Runing", label: "Running", icon: RefreshCw },
      { value: "Completed", label: "Completed", icon: CheckCircle },
    ];

    const currentStatusOption = statusOptions.find(
      (opt) => opt.value === status
    );
    const Icon = currentStatusOption?.icon || CheckCircle;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-sm text-white text-xs font-semibold w-[120px] justify-center hover:opacity-90 transition-opacity
    ${
      status === "Completed"
        ? "bg-primary"
        : status === "Runing"
        ? "bg-secondary-foreground"
        : "bg-primary-foreground"
    }
  `}
          >
            <Icon
              className={`h-3.5 w-3.5 ${
                status === "Runing" ? "animate-spin" : ""
              }`}
            />
            {status}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {statusOptions.map((option) => {
            const OptionIcon = option.icon;
            return (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleStatusUpdate(bookingId, option.value)}
                disabled={status === option.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <OptionIcon
                  className={`h-4 w-4 ${
                    option.value === "Runing" ? "animate-spin" : ""
                  }`}
                />
                <span>{option.label}</span>
                {status === option.value && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    Current
                  </span>
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    if (status === "Paid") {
      return (
        <span className="bg-gray-100 text-accent-foreground text-xs px-3 py-1 rounded-sm font-medium">
          {status}
        </span>
      );
    }
    return (
      <span className="bg-gray-100 text-accent-foreground text-xs px-3 py-1 rounded-sm font-medium">
        {status}
      </span>
    );
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
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <CardTitle className="text-xl font-bold text-slate-800">
            Car Bookings
          </CardTitle>
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search client name & car etc..."
              className="w-[270px]"
            />

            {/* Filter Dropdown */}
            <div className="w-[120px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full bg-secondary border text-white ">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  {statusFilterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Add Bookings Button */}
            <Button className="bg-primary-foreground hover:bg-primary/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Bookings
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="w-full overflow-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-[#E2FBFB] text-slate-800">
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    Booking ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    Client Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    Car Model
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    Plan
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold">
                    payment
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold">
                    status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-accent-foreground">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((booking, index) => (
                    <motion.tr
                      key={`${booking.id}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="hover:bg-gray-50/50"
                    >
                      <td className="px-6 py-2 text-sm font-medium text-slate-700">
                        {booking.id}
                      </td>
                      <td className="px-6 py-2">
                        <div className="flex flex-col gap-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-accent-foreground w-8">
                              Start
                            </span>
                            <span className="bg-secondary text-white px-3 py-1 rounded text-[11px] font-medium min-w-[80px] text-center">
                              {booking.startDate}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-accent-foreground w-8">
                              End
                            </span>
                            <span className="bg-muted text-white px-3 py-1 rounded text-[11px] font-medium min-w-[80px] text-center">
                              {booking.endDate}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-2 text-sm text-slate-700 font-medium">
                        {booking.clientName}
                      </td>
                      <td className="px-6 py-2">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium text-slate-700">
                            {booking.carModel}
                          </span>
                          <span className="bg-gray-100 text-accent-foreground text-xs px-2 py-0.5 rounded w-fit">
                            {booking.licensePlate}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-2 text-sm text-slate-700 font-medium">
                        {booking.plan}
                      </td>
                      <td className="px-6 py-2">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-sm font-semibold text-slate-700">
                            {booking.payment}
                          </span>
                          {getPaymentStatusBadge(booking.paymentStatus)}
                        </div>
                      </td>
                      <td className="px-6 py-2 text-right rounded-sm">
                        {getStatusButton(booking.status, booking.id)}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

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
                  {[10, 20, 50].map((option) => (
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
                          ? "bg-primary text-white"
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
    </motion.div>
  );
}
