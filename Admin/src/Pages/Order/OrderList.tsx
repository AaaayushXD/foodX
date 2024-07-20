import { Download, Filter, Search } from "lucide-react";
import data from "../../data.json";
import { DropDown } from "../../Components/Common/DropDown/DropDown";
import { useCallback, useEffect, useState } from "react";
import { getOrders } from "../../Services";
import { Order } from "../../models/order.model";
import {
  deleteOrderFromDatabase,
  updateOrderStatus,
} from "../../firebase/order";
import Table from "../../Components/Common/Table/Table";
import { debounce } from "../../Utility/Debounce";
import { SearchOrder, SearchProduct } from "../../Utility/Search";
import { getFullName } from "../../Utility/Utils";
import toast from "react-hot-toast";

const OrderList = () => {
  const [initialOrders, setInitialOrders] = useState<Order[]>([]);
  const [orderHeader, setOrderHeader] = useState<string[]>([]);

  const handleCheckboxChange = (
    rowIndex: number,
    colName: string,
    checked: boolean
  ) => {
    console.log(rowIndex, colName, checked);
  };

  const handleChange = (value: string) => {
    const filterOrder = SearchOrder(initialOrders, value);
    if (value?.length === 0) getAllOrders();
    setInitialOrders(filterOrder);
  };

  const changeOrderStatus = async (value: string, uid: string) => {
    try {
      await updateOrderStatus(value, uid);
      await getAllOrders();
      toast.success("Updated status");
    } catch (error) {
      throw new Error("Unable to update order status");
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!orderId) throw new Error("orderId not found");
    try {
      await deleteOrderFromDatabase(orderId);
    } catch (error) {
      throw new Error("Unable to delete order" + error);
    }
  };

  const debouncedHandleChange = useCallback(debounce(handleChange, 350), [
    initialOrders,
  ]);

  const getAllOrders = async () => {
    try {
      //  get total orders data from  server
      const orders = await getOrders();
      const totalOrders = orders.data as Order[];
      console.log(totalOrders);
      const aggregateData = totalOrders?.map(async (item) => {
        const getUserName = await getFullName(item?.uid);
        console.log(getUserName);
        if (getUserName) {
          const productNames = item.products?.map(
            (product) => product.name as string
          );
          return { ...item, uid: getUserName, products: productNames };
        }
      });
      const getaggregateDataPromises = await Promise.all(aggregateData);

      if (getaggregateDataPromises)
        setInitialOrders(getaggregateDataPromises as Order[]);
    } catch (error) {
      throw new Error("Unable to display orders data" + error);
    }
  };

  useEffect(() => {
    (async () => {
      getAllOrders();
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (initialOrders.length > 0) {
          const headersOfOrder = initialOrders[0];
          const keys = Object.keys(headersOfOrder);
          keys.push("Button");
          setOrderHeader(keys);
        }
      } catch (error) {
        throw new Error(error);
      }
    })();
  }, [initialOrders]);

  return (
    <div className="flex flex-col items-start justify-center w-full gap-5 px-5 py-4 rounded-sm">
      {/* <div className="flex flex-col-reverse items-start justify-between w-full gap-5 sm:flex-row sm:gap-2 sm:items-center">
        <form action="" className="relative w-full">
          <Search className="absolute top-3 cursor-pointer text-[var(--dark-secondary-text)]   size-5 left-2" />
          <input
            type="search"
            onChange={(event) => debouncedHandleChange(event.target.value)}
            className=" pl-9 border-[1px] placeholder:text-sm outline-none w-full sm:w-[300px] rounded py-2 px-8 border-[var(--dark-secondary-text)] "
            placeholder="Search"
          />
        </form>
        <div className="flex items-center justify-center gap-4">
          <button className="flex items-center gap-2 justify-center bg-[var(--primary-color)] text-[var(--light-foreground)] py-[0.4rem] border-[1px] border-[var(--primary-color)] px-4 rounded">
            <Download className="size-4" />
            <span className="text-[15px] ">Export</span>
          </button>
          <DropDown
            options={[]}
            children={
              <>
                {" "}
                <Filter className="size-4" />
                <span>Filter</span>
              </>
            }
            style={{
              display: "flex",
              fontSize: "15px",
              borderRadius: "4px",
              padding: "0.5rem 1rem 0.5rem 1rem",
              color: "var(--dark-text)",
              border: "1px solid var(--dark-secondary-text)  ",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              background: "",
            }}
          />
        </div>
      </div> */}

      <div className="flex items-center justify-between w-full pt-5">
        <div className="flex flex-col items-start justify-center gap-1">
          <h4 className="text-xl tracking-wider text-[var(--dark-text)]">
            Orders
          </h4>
        </div>
        <div className="flex items-center justify-center gap-5 ">
          <div className="flex items-center justify-center gap-2">
            <button className="flex items-center gap-2 justify-center bg-[var(--primary-color)] text-[var(--light-foreground)] py-[0.5rem] border-[1px] border-[var(--primary-color)] px-4 rounded">
              <Download className="size-4" />
              <p className="text-[15px]">Export</p>
            </button>
            <DropDown
              children={
                <>
                  <Filter className="size-4 text-[var(--dark-secondary-text)]" />
                  <span className="text-[var(--dark-secondary-text)]">
                    Filter
                  </span>
                </>
              }
              options={[]}
              style={{
                display: "flex",
                fontSize: "15px",
                borderRadius: "4px",
                padding: "0.5rem 1rem 0.5rem 1rem",
                color: "var(--dark-text)",
                border: "1px solid var(--light-secondary-text)  ",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                background: "",
              }}
            />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-start w-full pb-5">
        <form action="" className="relative w-full">
          <label htmlFor="search">
            <Search className="absolute text-[var(--dark-secondary-text)] cursor-pointer top-3 size-5 left-2" />
          </label>
          <input
            id="search"
            type="search"
            onChange={(event) => debouncedHandleChange(event?.target.value)}
            className=" pl-9 border placeholder:text-sm outline-none sm:w-[250px] w-full py-2 px-8 border-[var(--dark-secondary-background)] rounded bg-transparent focus:border-[var(--primary-color)] "
            placeholder="Search"
          />
        </form>
      </div>
      <div className="w-full overflow-auto shadow-inner shadow-lime-300 rounded-t-md">
        <Table
          loading={false}
          option={(value: string, orderId: string) =>
            changeOrderStatus(value, orderId)
          }
          options={["Pending", "Canceled", "Recieved", "Delivered"]}
          actions={(value) => handleDelete(value)}
          pagination={{ currentPage: 1, perPage: 10 }}
          width="800px"
          colSpan={"7"}
          data={initialOrders}
          headers={orderHeader}
          onCheckBoxChange={handleCheckboxChange}
        />
      </div>
    </div>
  );
};

export default OrderList;