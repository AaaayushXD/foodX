import { ChevronRight } from "lucide-react";
import { ColumnProps } from "../../models/table.model";
import { useEffect, useState } from "react";
import Table from "../../Components/Common/Table/Table";
import { GetOrderModal, Order, UserOrder } from "../../models/order.model";
import { getOrderByUser } from "../../Services/order.services";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../Store";
import { aggregateUserOrder } from "./order";
import { useNavigate, useRouteLoaderData } from "react-router-dom";
import {
  addToCart,
  removeCart,
  resetCart,
} from "../../Reducer/product.reducer";
import toast from "react-hot-toast";

export const OrderHistory = () => {
  const navigate = useNavigate();

  const [initialOrder, setInitialOrder] = useState<UserOrder[]>([]);
  const [currentDoc, setCurrentDoc] = useState<{
    currentFirstDoc: string;
    currentLastDoc: string;
  }>();
  const [selectedId, setSelectedId] = useState<string>();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [pagination, setPagination] = useState<{
    currentPage: number;
    perPage: number;
  }>({ currentPage: 1, perPage: 5 });
  const [totalData, setTotalData] = useState<number>();
  const [loading, setLoading] = useState<boolean>(false);
  const authUser = useSelector((state: RootState) => state.root.auth.userInfo);
  const Columns: ColumnProps[] = [
    {
      fieldName: "Id",
      colStyle: { width: "100px", textAlign: "start" },
      render: (item: UserOrder) => (
        <div className=" !p-0 w-[100px]   relative cursor-pointer group/id text-center ">
          #{item.id?.substring(0, 8)}
          <div
            className=" top-[-27px] mx-2  text-[15px] -left-2 group-hover/id:visible opacity-0 group-hover/id:opacity-[100] duration-150 invisible   absolute bg-[var(--light-foreground)] p-0.5
           rounded shadow "
          >
            {item.id}
          </div>
        </div>
      ),
    },
    {
      fieldName: "Items",
      colStyle: {
        width: "180px ",
        justifyContent: "start",
        textAlign: "start",
      },
      render: (item: UserOrder) => (
        <div className=" w-[180px]  flex items-center justify-start gap-1 text-[var(--dark-text)]">
          <p>
            {item.id == selectedId && isCollapsed
              ? item.products.map(
                  (product) => `${product.name}* ${product.quantity}`
                )
              : item.products[0].name + " * " + item.products[0].quantity}
          </p>
          <span
            onClick={() => {
              setSelectedId(item.id);
              setIsCollapsed(!isCollapsed);
            }}
          >
            <ChevronRight
              className={`size-5 ${
                selectedId === item.id && isCollapsed ? "rotate-90" : ""
              }  duration-200 cursor-pointer `}
            />
            {}{" "}
          </span>
        </div>
      ),
    },
    {
      fieldName: "Date",
      colStyle: { width: "135px", justifyContent: "start", textAlign: "start" },
      render: (item: UserOrder) => (
        <div className=" w-[135px] flex flex-col items-start justify-center text-[var(--dark-text)] ">
          <span>{item.time}</span>
        </div>
      ),
    },
    {
      fieldName: "Status",
      colStyle: { width: "140px", justifyContent: "start", textAlign: "start" },
      render: (item: UserOrder) => (
        <div className=" w-[140px]  gap-2 flex  items-center justify-start  text-[var(--dark-text)]  ">
          <div
            className={`w-2 h-2 rounded-full ${
              item.status === "Received"
                ? "bg-[var(--primary-color)] "
                : item.status === "Delivered"
                ? "bg-[var(--green-bg)] "
                : item.status === "Pending"
                ? "bg-[var(--primary-light)] "
                : item.status === "Canceled"
                ? "bg-[var(--danger-bg)]"
                : item.status === "Preparing"
                ? "bg-[var(--orange-bg)] "
                : ""
            } `}
          ></div>
          <span>{item.status}</span>
        </div>
      ),
    },
    {
      fieldName: "Amount",
      colStyle: { width: "100px", justifyContent: "start", textAlign: "start" },
      render: (item: UserOrder) => (
        <div className=" w-[100px]  flex flex-col items-start justify-center text-[var(--dark-text)] ">
          <span>{item.amount}</span>
        </div>
      ),
    },
    {
      fieldName: "Payment",
      colStyle: { width: "170px", justifyContent: "start", textAlign: "start" },
      render: (item: UserOrder) => (
        <div className=" w-[170px]  flex flex-col items-start justify-center text-[var(--dark-text)] ">
          <span>{item.payment}</span>
        </div>
      ),
    },
  ];

  const dispatch = useDispatch<AppDispatch>();

  const getUserOrders = async ({
    pageSize,
    currentFirstDoc,
    currentLastDoc,
    direction,
  }: GetOrderModal) => {
    setLoading(true);
    try {
      const response = await getOrderByUser({
        pageSize: pageSize,
        direction: direction,
        currentFirstDoc: currentFirstDoc || null,
        currentLastDoc: currentLastDoc || null,
      });
      const userOrder = response as {
        data: {
          length: number;
          orders: Order[];
          currentFirstDoc: string;
          currentLastDoc: string;
        };
      };
      setCurrentDoc({
        currentFirstDoc: userOrder.data.currentFirstDoc,
        currentLastDoc: userOrder.data.currentLastDoc,
      });
      setTotalData(userOrder.data.length);
      const orderHistory = aggregateUserOrder(userOrder.data.orders);
      setInitialOrder((prevOrders) => {
        if (!prevOrders || prevOrders.length === 0) {
          return orderHistory; // Set the initial order if none exists
        }

        // Combine existing orders with new ones, ensuring no duplicate IDs
        const updatedOrders = [
          ...prevOrders,
          ...orderHistory.filter(
            (data) => !prevOrders.some((orderData) => orderData.id === data.id)
          ),
        ];

        return updatedOrders;
      });
    } catch (error) {
      throw new Error("Error while fetching user-order");
    }
    setLoading(false);
  };
  console.log(useRouteLoaderData);

  useEffect(() => {
    if (pagination.currentPage === 1) {
      getUserOrders({
        pageSize: pagination.perPage,
        filter: "orderId",
        sort: "asc",
        currentFirstDoc: null,
        currentLastDoc: null,
        userId: authUser.uid,
      });
    }
    if (pagination.currentPage > 1 && currentDoc?.currentLastDoc) {
      getUserOrders({
        pageSize: pagination.perPage,
        currentFirstDoc: currentDoc.currentFirstDoc,
        currentLastDoc: currentDoc.currentLastDoc,
        direction: "next",
      });
    }
  }, [pagination.perPage, pagination.currentPage]);

  return (
    <div className="w-full h-full text-[var(--dark-text)] flex flex-col gap-6 bg-[var(--light-foreground)] px-5 py-4   rounded items-start justify-center">
      <h1 className="text-[25px] font-semibold tracking-wider ">
        Order History
      </h1>

      <Table
        actions={{
          orderFn: async (id: string) => {
            const findProduct = initialOrder.find((order) => order.id === id);
            dispatch(resetCart());
            findProduct?.products.forEach((product) => {
              dispatch(addToCart({ ...product }));
            });
            navigate("/cart/checkout");
          },
          downloadFn: (id: string) => toast.success("We will integrate soon!"),
        }}
        pagination={{
          currentPage: pagination?.currentPage,
          perPage: pagination?.perPage,
        }}
        onPageChange={(page: number) =>
          setPagination((prev) => ({ ...prev, currentPage: page }))
        }
        headStyle={{ width: "100%" }}
        bodyHeight={400}
        columns={Columns}
        data={initialOrder}
        totalData={totalData as number || 1}
        loading={loading}
      />
    </div>
  );
};
