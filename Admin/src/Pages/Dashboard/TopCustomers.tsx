import { useEffect, useState } from "react";
import { CustomerCard } from "../../Components/Common/Cards/CustomerCard";
import { CustomerType } from "../../models/user.model";
import { getTopCustomers } from "../../Utility/CustomerUtils";
import { FilterButton } from "../../Components/Common/Sorting/Sorting";
import Skeleton from "react-loading-skeleton";
import { Filter } from "lucide-react";
import { Button } from "../../Components/Common/Button/Button";

export const TopCustomers = () => {
  const [TopCustomer, setTopCustomer] = useState<CustomerType[]>([]);
  const [originalData, setOriginalData] = useState<CustomerType[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleSelect = async (value: string | undefined) => {
    console.log(value);
    let sortedCustomers;
    if (value === "totalOrders") {
      sortedCustomers = TopCustomer?.sort((a: CustomerType, b: CustomerType) =>
        sortOrder === "desc"
          ? (((b.totalOrder as number) - a.totalOrder) as number)
          : (((a.totalOrder as number) - b.totalOrder) as number)
      );
    }
    if (value === "totalSpent") {
      sortedCustomers = TopCustomer?.sort((a: CustomerType, b: CustomerType) =>
        sortOrder === "desc"
          ? (((b.amountSpent as number) - a.amountSpent) as number)
          : (((a.amountSpent as number) - b.amountSpent) as number)
      );
    }
    if (value === undefined) {
      return setTopCustomer(originalData);
    }
    setTopCustomer(sortedCustomers as CustomerType[]);
  };

  useEffect(() => {
    (async () => {
      const customers = await getTopCustomers();
      setOriginalData(customers as CustomerType[]);
      if (customers) setTopCustomer(customers as CustomerType[]);
    })();
  }, []);
  console.log(originalData);

  return (
    <div className="w-full border-[1px] border-[var(--dark-border)] text-[var(--dark-text)] h-[394px] flex flex-col justify-start  items-start px-2 rounded-md py-3 ">
      <div className="flex items-center text-[var(--dark-text)] justify-between w-full gap-3 px-3 pt-3 pb-5">
        <h4 className="text-xl">Top Customers</h4>
        <div>
          <Button
            bodyStyle={{
              width: "250px",
              top: "3rem",
              left: "-8.9rem",
              zIndex: 10000,
            }}
            parent={
              <div className="flex border-[1px] border-[var(--dark-border)] px-4 py-2 rounded items-center justify-start gap-2">
                <Filter
                  strokeWidth={2.5}
                  className="size-5 text-[var(--dark-text)] "
                />
                <p className="text-[16px] text-[var(--dark-secondary-text)] tracking-widest ">
                  Filter
                </p>
              </div>
            }
            checkFn={{
              checkSortFn: (isChecked: boolean, value: string) => {
                if (!isChecked) {
                  return handleSelect((value = undefined));
                }
                handleSelect(value);
              },
            }}
            sort={[
              { label: "Orders", value: "totalOrders", id: "flkiogrgaiosjd" },
              { label: "Amount", value: "totalSpent", id: "lfwrtpokjds" },
            ]}
            sortFn={(type: "asc" | "desc") =>
              setSortOrder(type as "asc" | "desc")
            }
          />
        </div>
      </div>
      <div className="flex flex-col gap-3  w-full  flex-grow overflow-y-scroll">
        {TopCustomer?.length > 0 ? (
          TopCustomer?.map((customer, index) => (
            <CustomerCard key={customer.id} prop={customer} index={index} />
          ))
        ) : (
          <div className="w-full ">
            <Skeleton
              baseColor="var(--light-background)"
              highlightColor="var(--light-foreground)"
              height={70}
              count={5}
            />
          </div>
        )}
      </div>
    </div>
  );
};
