import { useEffect, useState } from "react";
import { CustomerCard } from "../../Components/Common/Cards/CustomerCard";
import { User } from "../../models/user.model";
import { getTopCustomers } from "../../Utility/user.utils";

import Skeleton from "react-loading-skeleton";
import { Filter } from "lucide-react";
import { Button } from "../../Components/Common/Button/Button";
import { Empty } from "../../Components/Common/Empty/Empty";
import CustomerLogo from "../../assets/customer.png";
import { getUsers } from "../../Services/user.services";

export const TopCustomers = () => {
  const [TopCustomer, setTopCustomer] = useState<User[]>([]);
  const [originalData, setOriginalData] = useState<User[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState<boolean>(false);
  const [isRefresh, setIsRefresh] = useState<boolean>(false);

  const handleSelect = async (value: string | undefined) => {
    let sortedCustomers;
    if (value === "totalOrders") {
      sortedCustomers = TopCustomer?.sort((a: User, b: User) =>
        sortOrder === "desc"
          ? (((b.totalOrder as number) - a.totalOrder) as number)
          : (((a.totalOrder as number) - b.totalOrder) as number)
      );
    }
    if (value === "totalSpent") {
      sortedCustomers = TopCustomer?.sort((a: User, b: User) =>
        sortOrder === "desc"
          ? (((b.amountSpent as number) - a.amountSpent) as number)
          : (((a.amountSpent as number) - b.amountSpent) as number)
      );
    }
    if (value === undefined) {
      return setTopCustomer(originalData);
    }
    setTopCustomer(sortedCustomers as User[]);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const customers = await getUsers({
          pageSize: 5,
          path: "customer",
          sort: "asc",
          filter: "totalOrder",
          direction: "next",
        });
        setOriginalData(customers as User[]);
        if (customers) setTopCustomer(customers.data.users as User[]);
      } catch (error) {
        setLoading(false);
        setOriginalData([]);
        throw new Error("Error while fetching customer data" + error);
      }
      setLoading(false);
    })();
  }, [isRefresh]);

  return (
    <div className="w-full border-[1px] border-[var(--dark-border)] text-[var(--dark-text)] h-[400px] flex flex-col justify-start  items-start px-2 rounded-md py-3 ">
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
      <div className="flex flex-col gap-3  w-full  flex-grow scrollbar-custom overflow-y-scroll">
        {!loading ? (
          TopCustomer?.length > 0 ? (
            TopCustomer?.map((customer, index) => (
              <CustomerCard key={customer.uid} prop={customer} index={index} />
            ))
          ) : (
            <Empty
              actionText="Refresh customer"
              action={() => setIsRefresh(!isRefresh)}
              children="No Top customer available"
              parent={CustomerLogo}
              style={{ width: "10rem", height: "9rem" }}
            />
          )
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
