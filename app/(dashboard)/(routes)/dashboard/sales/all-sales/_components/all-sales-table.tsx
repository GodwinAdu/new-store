"use client";

import { DataTable } from "@/components/table/data-table";
import { Separator } from "@/components/ui/separator";
import React, { useCallback, useEffect, useState } from "react";
import { columns } from "./column";
// import { fetchSalesByDate } from "@/lib/actions/sale.actions";
import { DateRangePicker } from "@/components/commons/DateRangePicker";
import { DateRange } from "react-day-picker";
import { debounce } from "lodash";

const SalesTable = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 0, 1),
    to: new Date(2025, 11, 31),
  });

  const [salesData, setSalesData] = useState([]);


  // useEffect(() => {
  //   // Ensure `dateRange` has valid values before fetching data
  //   if (!dateRange?.from || !dateRange?.to) return;

  //   let isMounted = true; // Flag to track if the component is still mounted

  //   const fetchData = async () => {
  //     setIsLoading(true);
  //     try {
  //       const sales = await fetchSalesByDate(dateRange.from as Date, dateRange.to as Date);
  //       if (isMounted) {
  //         setSalesData(sales);
  //       }
  //     } catch (error) {
  //       if (isMounted) {
  //         console.error("Failed to fetch sales:", error);
  //       }
  //     } finally {
  //       if (isMounted) {
  //         setIsLoading(false);
  //       }
  //     }
  //   };

  //   fetchData();

  //   return () => {
  //     isMounted = false; // Cleanup to prevent state updates after unmount
  //   };
  // }, [dateRange]);

  const fetchSales = async (from: Date, to: Date) => {
    setIsLoading(true);
    try {
      // const sales = await fetchSalesByDate(from, to);
      setSalesData([]);
    } catch (error) {
      console.error("Error fetching sales:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced version of the fetchSales function
  const debouncedFetchSales = useCallback(
    debounce((from, to) => {
      fetchSales(new Date(from), new Date(to));
    }, 500), // 500ms debounce delay
    []
  );

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      debouncedFetchSales(dateRange.from, dateRange.to);
    }

    // Cleanup the debounced function on unmount
    return () => {
      debouncedFetchSales.cancel();
    };
  }, [dateRange, debouncedFetchSales]);

  console.log(salesData, "sales")

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          <DateRangePicker
            className="w-[300px]"
            onDateRangeChange={setDateRange}
          />
        </div>
      </div>
      <Separator />
      <DataTable isLoading={isLoading} searchKey="saleDate" columns={columns} data={salesData} />
    </>
  );
};

export default SalesTable;
