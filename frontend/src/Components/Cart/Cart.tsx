import React from "react";
import SingleCard from "./SingleCard";
import { useSelector } from "react-redux";
import { RootState } from "../../Reducer/Store";

const Cart: React.FC = () => {
  const product = useSelector((state: RootState) => state.cart.products);
  return (
    <div className="lg:flex hidden flex-col items-start gap-2  justify-between  bg-[var(--light-foreground)] px-[5px] my-8 py-4 rounded-md w-[400px]">
      <div className=" flex flex-col ietems-start gap-[20px]">
        <h3 className="text-[30px] font-Poppins font-semibold w-full -text--dark-text">
          My Order
        </h3>
        {product?.map((item, index) => (
          <>
            <SingleCard prop={item} key={index} />
          </>
        ))}
      </div>
      <div className="flex flex-col  w-full justify-evenly gap-[20px]">
        <div className="w-full py-[10px] rounded-md px-[20px] flex justify-between bg-[var(--primary-light)]">
          <h3 className="text-[15px]  -text--dark-text font-Poppins font-extralight">
            Total Amount :
          </h3>
          <h3 className="text-[15px] font-Poppins font-bold">450</h3>
        </div>
        <div className="py-[10px] cursor-pointer rounded-md px-[10px] w-full bg-[var(--primary-color)] text-center text-[white] hover:bg-[var(--primary-dark)]  ">
          <button>checkout</button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
