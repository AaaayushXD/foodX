import { ArrowRight } from "lucide-react";
import { Order, UserOrder } from "../../models/order.model";


interface RecentCardProp{
  item : UserOrder
}

export const RecentCard: React.FC<RecentCardProp> = ({ item }) => {
    return (
      <div className="w-[550px] rounded-l-lg pr-5 h-full border-[1px] border-[var(--dark-border)] rounded-lg gap-5  flex items-center justify-center">
        <div className="w-[350px] rounded-l-lg h-[200px]">
          <img
            src={item.productImage}
            className=" rounded-l-lg w-full h-full bg-slate-100 rounded-sm "
          ></img>
        </div>
        <div className="flex flex-col w-full items-start gap-3 justify-between h-full">
          <p className="text-[16px] text-gray-400 ">#{item.id.slice(0,10)} </p>
          <div className="w-full flex items-center justify-between">
            <p className="text-[var(--dark-secondary-text)] tracking-wider font-semibold gap-4 text-[16px] ">
         {item.time.split(" ")[0]}
            </p>
            <p className="text-[var(--dark-secondary-text)] tracking-wider font-semibold gap-4 text-[16px] ">
             {item.time.split(" ")[1]}{" "}{item.time.split(" ")[2]}
            </p>
          </div>
          <div className="flex pb-5 text-[14px] font-semibold w-full text-gray-500 border-b-[2px] border-[var(--dark-border)] items-center justify-start">
          {item.products}
          </div>
          <div className="flex  items-center justify-between w-full">
            <span className=" font-semibold text-[var(--dark-text)] text-[17px] tracking-wider ">
           {item.amount}
            </span>
            <button className=" font-semibold duration-150 gap-2 flex items-center justify-start text-[var(--primary-color)] hover:text-[var(--primary-light)] ">
              Order Again <ArrowRight className="size-5" />{" "}
            </button>
          </div>
        </div>
      </div>
    );
  };
  