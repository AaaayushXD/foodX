import { LineChart } from "@mui/x-charts";
import { ArrowUp, Filter, MoveUp, X } from "lucide-react";
import "./LineChart.css";
import { chartData } from "../../data.json";
import { useEffect, useState } from "react";
import { Button } from "../Common/Button/Button";
import { Dayjs } from "dayjs";
import {
  monthlyRevenue,
  monthlyTotal,
  previousMonthOrder,
  weeklyRevenue,
} from "./LineChartData";

interface MonthlyLineChartProps {
  dateRange: { startDate: Dayjs; endDate: Dayjs };
}
export const WeekReveneuChart: React.FC = () => {
  const [initialData, setInitialData] =
    useState<{ time: string; revenue: number }[]>();
  const [prevData, setPrevData] = useState<any>([]);

  useEffect(() => {
    const revenue = weeklyRevenue(chartData);
    setInitialData(revenue);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full gap-5 px-3 py-5 rounded">
      <div className="flex items-center justify-between w-full gap-3 px-2">
        <div className="text-left text-xl text-[var(--dark-text)] flex justify-center items-center gap-3">
          <p className="text-nowrap">Weekly Revenue</p>
          <p className="text-[16px] text-[var(--green-text)] p-1 flex justify-center items-center gap-0.5  rounded-lg">
            10%
            <span>
              <MoveUp size={14} className="mb-[3px]" />
            </span>
          </p>
        </div>
      </div>
      <div className="h-[400px] lg:h-[300px] w-full">
        <LineChart
          sx={{
            "& .MuiLineElement-root": {
              strokeDasharray: "2 2",
              strokeWidth: 3,
            },
            "& .MuiAreaElement-series-Germany": {
              fill: "url('#myGradient')",
            },
            "& .MuiChartsHoverLine": {
              stroke: "var(--dark-text)", // Set the hover line color to white
              strokeWidth: 1, // Adjust the thickness as needed
            },
            "& .MuiChartsAxis-bottom .MuiChartsAxis-line": {
              stroke: "var(--dark-text)", // Blue color for the X-axis line
              strokeWidth: 0.8,
            },
            "& .MuiChartsAxis-left .MuiChartsAxis-line": {
              stroke: "var(--dark-text)", // Blue color for the Y-axis line
              strokeWidth: 0.8,
            },
            "& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabel": {
              letterSpacing: "2px",
              fill: "var(--dark-text)", // Blue color for the X-axis labels
              strokeWidth: "0.5",
            },

            "& .MuiChartsAxis-left .MuiChartsAxis-tickLabel": {
              fill: "var(--dark-text)", // Red color for the Y-axis labels
              strokeWidth: "0.4",
              letterSpacing: "2px",
            },
          }}
          slotProps={{
            legend: {
              direction: "row",
              labelStyle: { fontSize: "14px" },
              position: { vertical: "bottom", horizontal: "middle" },
            },
          }}
          xAxis={[
            {
              data: initialData?.map((order) => order["time"]),
              scaleType: "point",
            },
          ]}
          series={[
            {
              data: initialData?.map((order) => order["revenue"]),
              type: "line",
              color: "#45c241",
            }
          ]}
          grid={{ vertical: true, horizontal: true }}
        ></LineChart>
      </div>
    </div>
  );
};

export const MonthlyRevenueChart: React.FC<MonthlyLineChartProps> = () => {
  const [initialData, setInitialData] =
    useState<{ time: string; revenue: number }[]>();
  const [filter, setFilter] = useState<{
    dateFilter?: string;
    normalFilter?: string;
  }>();

  useEffect(() => {
    if (filter?.dateFilter || filter?.normalFilter) {
      const monthlyData = monthlyRevenue(chartData.reverse());
      setInitialData(monthlyData);
    } else {
      const monthlyData = monthlyRevenue(chartData);
      setInitialData(monthlyData);
    }
  }, [filter?.normalFilter, filter?.dateFilter]);

  // useEffect(() => {}, [dateRange.startDate, dateRange.endDate]);

  return (
    <div className="flex flex-col h-[430px] items-center justify-start w-full gap-1 p-3 rounded">
      <div className="flex  items-center justify-between w-full gap-3 ">
        <div className="text-left text-xl text-[var(--dark-text)] flex justify-center items-center gap-2">
          <p className="text-nowrap">Weekly Revenue</p>
          <p className="text-[16px] tracking-wider  text-[var(--green-text)]  flex justify-center items-center gap-0.5  rounded-lg">
            <span>10%</span>
            <span className="mb-[2px]">
              <MoveUp strokeWidth={3} size={14} />
            </span>
          </p>
        </div>
        <Button
          bodyStyle={{
            width: "400px",
            top: "3rem",
            left: "-18rem",
          }}
          types={[
            {
              label: "Previous week",
              value: "previous",
              id: "8933lfjsl840fhn",
            },
          ]}
          checkFn={{
            checkTypeFn: (isChecked: boolean, value: string) => {
              if (!isChecked) {
                setFilter((prev) => ({ ...prev, normalFilter: "" }));
              }
              if (isChecked) {
                setFilter((prev) => ({ ...prev, normalFilter: value }));
              }
            },
            dateActionFn: (from, to) => {
              if (from && to) {
                setFilter((prev) => ({
                  ...prev,
                  dateFilter: `${from} to ${to}`,
                }));
              }
            },
          }}
          parent={
            <div className="flex border-[1px] border-[var(--dark-border)]  px-4 py-2 rounded items-center justify-start gap-2">
              <Filter
                strokeWidth={2.5}
                className="size-5 text-[var(--dark-secondary-text)]"
              />
              <p className="text-[16px] text-[var(--dark-secondary-text)] tracking-widest ">
                Filter
              </p>
            </div>
          }
        />
      </div>
      <div className="flex  pt-1 h-[10px]  w-full  items-center justify-start gap-2">
        {filter?.dateFilter && (
          <div className="flex px-1 overflow-hidden py-0.5 gap-2 border-[var(--dark-secondary-text)]  items-center rounded border  justify-start">
            <div className="flex gap-1  items-center justify-center">
              <span className="text-[15px] w-[115px]   text-[var(--dark-secondary-text)]">
                {filter.dateFilter?.toLocaleLowerCase().slice(0, 15)}
              </span>
            </div>
            <button
              onClick={() => setFilter((prev) => ({ ...prev, dateFilter: "" }))}
              className=" "
            >
              <X className="text-[var(--danger-text)] " size={20} />
            </button>
          </div>
        )}
        {filter?.normalFilter && (
          <div className="flex px-1 py-0.5 gap-2 border-[var(--dark-secondary-text)]  items-center rounded border  justify-start">
            <div className="flex gap-1 items-center justify-center">
              <span className="text-[15px] text-[var(--dark-secondary-text)]">
                {filter.normalFilter?.toLocaleLowerCase().slice(0, 15)}
              </span>
            </div>
            <button
              onClick={() =>
                setFilter((prev) => ({ ...prev, normalFilter: "" }))
              }
              className=" "
            >
              <X className="text-[var(--danger-text)] " size={20} />
            </button>
          </div>
        )}
      </div>
      <div className="h-[400px] lg:h-[335px] w-full">
        <LineChart
          sx={{
            "& .MuiLineElement-root": {
              strokeDasharray: "2 2",
              strokeWidth: 3,
            },
            "& .MuiAreaElement-series-Germany": {
              fill: "url('#myGradient')",
            },
            "& .MuiChartsHoverLine": {
              stroke: "var(--dark-text)", // Set the hover line color to white
              strokeWidth: 1, // Adjust the thickness as needed
            },
            "& .MuiChartsAxis-bottom .MuiChartsAxis-line": {
              stroke: "var(--dark-text)", // Blue color for the X-axis line
              strokeWidth: 0.8,
            },
            "& .MuiChartsAxis-left .MuiChartsAxis-line": {
              stroke: "var(--dark-text)", // Blue color for the Y-axis line
              strokeWidth: 0.8,
            },
            "& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabel": {
              letterSpacing: "2px",
              fill: "var(--dark-text)", // Blue color for the X-axis labels
              strokeWidth: "0.5",
            },

            "& .MuiChartsAxis-left .MuiChartsAxis-tickLabel": {
              fill: "var(--dark-text)", // Red color for the Y-axis labels
              strokeWidth: "0.4",
              letterSpacing: "2px",
            },
          }}
          slotProps={{
            legend: {
              direction: "row",
              labelStyle: { fontSize: "14px" },
              position: { vertical: "bottom", horizontal: "middle" },
            },
          }}
          xAxis={[
            {
              data: initialData?.map((order) => order["time"]),
              scaleType: "point",
            },
          ]}
          series={[
            {
              data: initialData?.map((order) => order["revenue"]),
              type: "line",
              color: "#45c241",
            },
          ]}
          grid={{ vertical: true, horizontal: true }}
        ></LineChart>
      </div>
    </div>
  );
};

export const MonthlyOrderLinechart: React.FC<MonthlyLineChartProps> = () => {
  const [initialData, setInitialData] =
    useState<{ time: string; orders: number }[]>();
  const [filter, setIsFilter] = useState<{
    dateFilter?: string;
    normalFilter?: string;
  }>();
  const [previousData, setPreviousData] = useState<
    {
      time: string;
      orders: number;
    }[]
  >();

  useEffect(() => {
    if (filter?.dateFilter || filter?.normalFilter) {
      const monthlyData = previousMonthOrder(chartData.reverse());
      setInitialData(monthlyData);
    } else {
      const monthlyData = monthlyTotal(chartData);
      setInitialData(monthlyData);
    }
  }, [filter?.dateFilter, filter?.normalFilter]);

  // useEffect(() => {}, [dateRange.startDate, dateRange.endDate]);

  return (
    <div className="flex flex-col p-2 items-center justify-center w-full rounded">
      <div className="flex items-center justify-between w-full gap-3 ">
        <div className="  text-left text-xl text-[var(--dark-text)] flex justify-center items-center gap-2">
          <p className="text-nowrap">Weekly Order</p>
          <p className="text-[16px] tracking-wider  text-[var(--green-text)]  flex justify-center items-center gap-0.5  rounded-lg">
            <span>10%</span>
            <span className="mb-[2px]">
              <MoveUp strokeWidth={3} size={14} />
            </span>
          </p>
        </div>
        <Button
          bodyStyle={{
            width: "400px",
            top: "3rem",
            left: "-18rem",
          }}
          types={[{ label: "Previous", value: "previous", id: "8933840fhn" }]}
          checkFn={{
            checkTypeFn: (isChecked: boolean, value: string) => {
              if (!isChecked) {
                setIsFilter((prev) => ({ ...prev, normalFilter: "" }));
              }
              if (isChecked) {
                setIsFilter((prev) => ({ ...prev, normalFilter: value }));
              }
            },
            dateActionFn: (firstDate, secondDate) => {
              if (firstDate && secondDate) {
                setIsFilter((prev) => ({
                  ...prev,
                  dateFilter: `${firstDate} to ${secondDate} `,
                }));
              }
            },
          }}
          parent={
            <div className="flex border-[1px] border-[var(--dark-border)]  px-4 py-2 rounded items-center justify-start gap-2">
              <Filter
                strokeWidth={2.5}
                className="size-5 text-[var(--dark-secondary-text)]"
              />
              <p className="text-[16px] text-[var(--dark-secondary-text)] tracking-widest ">
                Filter
              </p>
            </div>
          }
        />
      </div>
      <div className="flex pt-1 h-[20px]  w-full   items-center justify-start gap-2">
        {filter?.dateFilter && (
          <div className="flex px-1 overflow-hidden py-0.5 gap-2 border-[var(--dark-secondary-text)]  items-center rounded border  justify-start">
            <div className="flex gap-1 items-center justify-center">
              <span className="text-[15px] w-[110px] text-[var(--dark-secondary-text)]">
                {filter.dateFilter?.toLocaleLowerCase().slice(0, 15)}
              </span>
            </div>
            <button
              onClick={() =>
                setIsFilter((prev) => ({ ...prev, dateFilter: "" }))
              }
              className=" "
            >
              <X className="text-[var(--danger-text)] " size={20} />
            </button>
          </div>
        )}
        {filter?.normalFilter && (
          <div className="flex px-1 py-0.5 gap-2 border-[var(--dark-secondary-text)]  items-center rounded border  justify-start">
            <div className="flex gap-1 items-center justify-center">
              <span className="text-[15px] text-[var(--dark-secondary-text)]">
                {filter.normalFilter?.toLocaleLowerCase().slice(0, 15)}
              </span>
            </div>
            <button
              onClick={() =>
                setIsFilter((prev) => ({ ...prev, normalFilter: "" }))
              }
              className=" "
            >
              <X className="text-[var(--danger-text)] " size={20} />
            </button>
          </div>
        )}
      </div>
      <div className="h-[398px]  lg:h-[398px] w-full">
        <LineChart
          sx={{
            "& .MuiLineElement-root": {
              strokeDasharray: "2 2",
              strokeWidth: 3,
            },
            "& .MuiAreaElement-series-Germany": {
              fill: "url('#myGradient')",
            },
            "& .MuiChartsHoverLine": {
              stroke: "var(--dark-text)", // Set the hover line color to white
              strokeWidth: 1, // Adjust the thickness as needed
            },
            "& .MuiChartsAxis-bottom .MuiChartsAxis-line": {
              stroke: "var(--dark-text)", // Blue color for the X-axis line
              strokeWidth: 0.8,
            },
            "& .MuiChartsAxis-left .MuiChartsAxis-line": {
              stroke: "var(--dark-text)", // Blue color for the Y-axis line
              strokeWidth: 0.8,
            },
            "& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabel": {
              letterSpacing: "2px",
              fill: "var(--dark-text)", // Blue color for the X-axis labels
              strokeWidth: "0.5",
            },

            "& .MuiChartsAxis-left .MuiChartsAxis-tickLabel": {
              fill: "var(--dark-text)", // Red color for the Y-axis labels
              strokeWidth: "0.4",
              letterSpacing: "2px",
            },
          }}
          slotProps={{
            legend: {
              hidden: true,
              direction: "row",
              labelStyle: { fontSize: "14px" },
              position: { vertical: "bottom", horizontal: "middle" },
            },
          }}
          xAxis={[
            {
              labelStyle: { color: "white" },
              data: initialData?.map((order) => order["time"]),
              scaleType: "point",
            },
          ]}
          series={[
            {
              data: initialData?.map((order) => order["orders"]),
              type: "line",
              color: "#45c241",
              highlightScope: { fade: "global", highlight: "item" },
            },
          ]}
          grid={{ vertical: true, horizontal: true }}
        ></LineChart>
      </div>
    </div>
  );
};
