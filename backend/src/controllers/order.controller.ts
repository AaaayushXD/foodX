import express from "express";
import {
  addNewOrderToDatabase,
  getAllOrders,
  getOrdersFromDatabase,
  updateOrderStatusInDatabase,
} from "../firebase/db/order.firestore.js";
import { Order } from "../models/order.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { redisClient } from "../utils/Redis.js";
import { User } from "../models/user.model.js";

const getAllOrdersFromDatabase = asyncHandler(async (_: any, res: any) => {
  try {
    const response = await getAllOrders();
    console.log(response);
    return res
      .status(200)
      .json(
        new ApiResponse(200, response, "Orders fetched successfully", true)
      );
  } catch (error) {
    throw new ApiError(
      501,
      "Error fetching orders from database.",
      null,
      error as string[]
    );
  }
});
const getOrderByUserIdFromDatabase = asyncHandler(
  async (req: any, res: any) => {
    let {
      pageSize,
      filter,
      sort,
      direction,
      currentFirstDoc,
      currentLastDoc,
      status,
    }: {
      pageSize: number;
      filter: keyof Order;
      sort: "asc" | "desc";
      currentFirstDoc: any | null;
      currentLastDoc: any | null;
      direction?: "prev" | "next";
      status?: "fullfilled" | "cancelled" | "preparing" | "received";
    } = req.body;
    try {
      const user: User = req.user;
      if (!user) throw new ApiError(500, "No user found. Please login first.");

      let { orders, firstDoc, lastDoc, length } = await getOrdersFromDatabase(
        pageSize,
        filter,
        sort,
        direction === "next" ? currentLastDoc : null,
        direction === "prev" ? currentFirstDoc : null,
        direction,
        status,
        user.uid
      );
      const pipeline = redisClient.multi();

      orders.forEach((order) => {
        pipeline.lPush(`latest_orders`, JSON.stringify(order));
      });

      pipeline.lRange("latest_orders", 0, 9);
      await pipeline.exec();

      res.status(200).json(
        new ApiResponse(
          200,
          {
            orders,
            currentFirstDoc: firstDoc,
            currentLastDoc: lastDoc,
            length,
          },
          "Successfully fetched orders from database",
          true
        )
      );
    } catch (error) {
      throw new ApiError(
        500,
        "Error while fetching user orders.",
        null,
        error as string[]
      );
    }
  }
);
const addNewOrder = asyncHandler(
  async (req: express.Request, res: express.Response) => {
    const order = req.body;
    if (!order) throw new ApiError(400, "Order not found");
    try {
      await addNewOrderToDatabase(order);
      const pipeline = redisClient.multi();
      pipeline.lPush("latest_orders", JSON.stringify(order));
      pipeline.lRange("latest_orders", 0, 9);
      await pipeline.exec();
      return res
        .status(200)
        .json(new ApiResponse(200, "", "Orders fetched successfully", true));
    } catch (error) {
      throw new ApiError(
        501,
        "Error while adding orders to database.",
        null,
        error as string[]
      );
    }
  }
);

const updateOrder = asyncHandler(
  async (req: express.Request, res: express.Response) => {
    const { id, status } = req.body;
    try {
      const updatedProduct = await updateOrderStatusInDatabase(id, status);
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { updatedProduct },
            "Product updated successfully.",
            true
          )
        );
    } catch (error) {
      throw new ApiError(500, "Error while updating products.");
    }
  }
);
const fetchOrders = asyncHandler(async (req: any, res: any) => {
  let {
    pageSize,
    filter,
    sort,
    direction,
    currentFirstDoc,
    currentLastDoc,
    status,
    userId,
  }: {
    pageSize: number;
    filter: keyof Order;
    sort: "asc" | "desc";
    currentFirstDoc: any | null;
    currentLastDoc: any | null;
    direction?: "prev" | "next";
    status?: "fullfilled" | "cancelled" | "preparing" | "received";
    userId?: string;
  } = req.body;

  try {
    let { orders, firstDoc, lastDoc, length } = await getOrdersFromDatabase(
      pageSize,
      filter,
      sort,
      direction === "next" ? currentLastDoc : null,
      direction === "prev" ? currentFirstDoc : null,
      direction,
      status,
      userId
    );
    const pipeline = redisClient.multi();

    orders.forEach((order) => {
      pipeline.lPush(`fetched_orders`, JSON.stringify(order));
    });

    await pipeline.exec();

    res.status(200).json(
      new ApiResponse(
        200,
        {
          orders,
          currentFirstDoc: firstDoc,
          currentLastDoc: lastDoc,
          length,
        },
        "Successfully fetched orders from database",
        true
      )
    );
  } catch (error) {
    throw new ApiError(
      401,
      "Something went wrong while fetching orders from database",
      null,
      error as string[]
    );
  }
});
export {
  getAllOrdersFromDatabase,
  getOrderByUserIdFromDatabase,
  addNewOrder,
  updateOrder,
  fetchOrders,
};
