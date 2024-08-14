import React, { useEffect, useState } from "react";
import PendingTicket from "../../Components/Tickets/PendingTicket";
import ProgressTicket from "../../Components/Tickets/ProgressTicket";
import ResolveTicket from "../../Components/Tickets/ResolveTicket";
import CancelTicket from "../../Components/Tickets/CancelTicket";
import { CirclePlus } from "lucide-react";
import Modal from "../../Components/Common/Popup/Popup";
import CreateTicket from "../../Components/Upload/CreateTicket";
import { getTickets } from "../../Services";
import toast from "react-hot-toast";
import {
  GetTicketModal,
  TicketState,
  TicketType,
} from "../../models/ticket.model";
import InfiniteScroll from "react-infinite-scroll-component";
import Skeleton from "react-loading-skeleton";
import { RotatingLines } from "react-loader-spinner";

// interface ButtonProp {
//   title: string[];
//   style?: ReactNode;
// }

const TicketPage: React.FC = () => {
  const [ticketState, setTicketState] = useState<TicketState>("Pending");
  const [pagination, setPagination] = useState<{
    perPage: number;
    currentPage: number;
  }>({ currentPage: 1, perPage: 4 });
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalData, setTotalData] = useState<number>(0);
  const [closeModal, setCloseModal] = useState<boolean>(true);
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [currentDoc, setCurrentDoc] = useState<{
    currentFirstDoc: string;
    currentLastDoc: string;
  }>();
  const [loading, setLoading] = useState<boolean>(false);

  const fetchTickets = async (data: GetTicketModal) => {
    setLoading(true);
    try {
      const tickets = (await getTickets({
        pageSize: data.pageSize,
        direction: data.direction,
        sort: data.sort,
        currentFirstDoc: data.currentFirstDoc || null,
        currentLastDoc: data.currentLastDoc || null,
      })) as {
        tickets: TicketType[];
        currentFirstDoc: string;
        currentLastDoc: string;
        length: number;
      };
      setCurrentDoc({
        currentFirstDoc: tickets.currentFirstDoc,
        currentLastDoc: tickets.currentLastDoc,
      });

      if (tickets.tickets.length < data.pageSize) {
        setHasMore(false); // If fewer logs are returned than requested, stop infinite scrolling.
      }

      setTotalData((prev) => prev + tickets.tickets.length);

      setTickets((prev) => {
        return [
          ...prev,
          ...tickets.tickets.filter(
            (data) => !prev.some((ticket) => ticket.id === data.id)
          ),
        ];
      });
    } catch (error) {
      toast.error("Unable to fetch ticket");
      throw new Error("Unable to fetch tickets" + error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets({
      direction: "next",
      pageSize: pagination?.perPage,
      sort: "asc",
      currentFirstDoc: null,
      currentLastDoc: null,
    });
  },[pagination.perPage])

  const TicketComponents = {
    Pending: <PendingTicket prop={tickets} loading={loading} />,
    Progress: <ProgressTicket prop={tickets} loading={loading} />,
    Resolved: <ResolveTicket prop={tickets} loading={loading} />,
    Rejected: <CancelTicket prop={tickets} loading={loading} />,
  };
  const component = ticketState && TicketComponents[ticketState];

  return (
    <div className="flex flex-col items-start justify-center px-4 py-5 gap-7">
      <div className="flex items-center justify-between w-full px-5">
        <h1 className="text-[25px] brightness-125 contrast-125 font-[600] text-[var(--dark-text)] ">
          Tickets
        </h1>
        <button
          onClick={() => setCloseModal(!closeModal)}
          className="flex items-center gap-2 justify-center bg-[var(--primary-color)] text-[var(--dark-text)] py-[0.4rem] border-[1px] border-[var(--primary-color)] px-4 rounded"
        >
          <CirclePlus className="size-5" />
          <span className="tex-[16px] tracking-wider "> New Ticket</span>
        </button>
        <Modal
          close={closeModal}
          children={<CreateTicket />}
          closeModal={() => setCloseModal(!closeModal)}
        />
      </div>
      <div className="grid  w-full grid-cols-4 gap-2 px-5 pt-10 sm:gap-6">
        <button
          onClick={() => setTicketState("Pending")}
          className={`${
            ticketState === "pending"
              ? "bg-[var(--primary-dark)]"
              : "bg-[var(--primary-light)]  "
          } py-3 hover:bg-[var(--primary-dark)]  sm:text-[15px] text-sm duration-150   font-[550] contrast-150 rounded text-[var(--dark-text)]`}
        >
          Pending
        </button>
        <button
          onClick={() => setTicketState("Progress")}
          className={` py-3 sm:text-[15px] hover:bg-[#bb8115]   duration-150 text-sm  font-[550] contrast-150 rounded text-[var(--dark-text)] ${
            ticketState === "progress"
              ? "bg-[#bb8115] "
              : "bg-[var(--orange-bg)]"
          } `}
        >
          Progress
        </button>
        <button
          onClick={() => setTicketState("Resolved")}
          className={`py-3 sm:text-[15px] hover:bg-[#287e28fd] duration-150   ${
            ticketState === "Resolved"
              ? "bg-[#287e28fd]"
              : "bg-[var(--green-bg)] "
          }  text-sm  font-[550] contrast-150 rounded text-[var(--dark-text)] `}
        >
          Resolve
        </button>
        <button
          onClick={() => setTicketState("Rejected")}
          className={`py-3 hover:bg-[#a82d2dfd] sm:text-[15px] duration-150  ${
            ticketState === "Rejected"
              ? "bg-[#a82d2dfd]"
              : " bg-[var(--danger-bg)] "
          }  text-sm  font-[550] contrast-150 rounded text-[var(--dark-text)] `}
        >
          Cancel
        </button>
      </div>
      {/* Employee Card */}
      <div id="ticketScrollable" className="w-full py-6 h-full overflow-auto">
        <div className="w-full h-[400px] ">
          <InfiniteScroll
            endMessage={
              <div className="w-full flex items-center justify-center py-3 text-[18px] tracking-wider ">
                No data to load
              </div>
            }
            scrollableTarget={"ticketScrollable"}
            loader={
              <div className="w-full flex flex-col items-center pt-3 justify-center ">
                {/* <Skeleton height={70} count={5} /> */}
                <div className="flex items-center justify-center gap-3">
                  <RotatingLines width="27" />
                  <span className="text-[17px] tracking-wider ">
                    {" "}
                    loading...
                  </span>
                </div>
              </div>
            }
            hasMore={hasMore}
            next={() => {
              fetchTickets({
                direction: "next",
                pageSize: pagination?.perPage,
                sort: "asc",
                currentFirstDoc: null || currentDoc?.currentFirstDoc,
                currentLastDoc: null || currentDoc?.currentLastDoc,
              });
            }}
            dataLength={totalData}
          >
            {component}
          </InfiniteScroll>
        </div>
      </div>
    </div>
  );
};

export default TicketPage;
