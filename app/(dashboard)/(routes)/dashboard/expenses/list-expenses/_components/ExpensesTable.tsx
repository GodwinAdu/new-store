"use client";

import { DataTable } from "@/components/table/data-table";
import { Separator } from "@/components/ui/separator";
import React, { useCallback, useEffect, useState } from "react";
import { DateRangePicker } from "@/components/commons/DateRangePicker";
import { DateRange } from "react-day-picker";
import { debounce } from "lodash";
import { columns } from "./column";
import { fetchAllExpenses } from "@/lib/actions/expenses.actions";

const currentYear = new Date().getFullYear();

const ExpensesTable = () => {
    const [isLoading, setIsLoading] = useState(false);

    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(currentYear, 0, 1),
        to: new Date(currentYear, 11, 31),
    });
    const [expensesData, setExpensesData] = useState([]);


    // useEffect(() => {
    //   // Ensure `dateRange` has valid values before fetching data
    //   if (!dateRange?.from || !dateRange?.to) return;

    //   let isMounted = true; // Flag to track if the component is still mounted

    //   const fetchData = async () => {
    //     setIsLoading(true);
    //     try {
    //       const sales = await fetchSalesByDate(dateRange.from as Date, dateRange.to as Date);
    //       if (isMounted) {
    //         setAdjustmentData(sales);
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

    const fetchExpenses = async (from: Date, to: Date) => {
        setIsLoading(true);
        try {
            const result = await fetchAllExpenses(from, to) || [];
            setExpensesData(result);
        } catch (error) {
            console.error("Error fetching Expenses:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Debounced version of the fetchExpenses function
    const debouncedFetchExpenses = useCallback(
        debounce((from, to) => {
            fetchExpenses(new Date(from), new Date(to));
        }, 500), // 500ms debounce delay
        []
    );

    useEffect(() => {
        if (dateRange?.from && dateRange?.to) {
            debouncedFetchExpenses(dateRange.from, dateRange.to);
        }

        // Cleanup the debounced function on unmount
        return () => {
            debouncedFetchExpenses.cancel();
        };
    }, [dateRange, debouncedFetchExpenses]);

    console.log(expensesData, "expenses")


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
            <DataTable isLoading={isLoading} searchKey="paymentMethod" columns={columns} data={expensesData} />
        </>
    );
};

export default ExpensesTable;
