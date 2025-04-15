"use client";

import { Line } from "react-chartjs-2";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from 'chart.js';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: false,
    },
  },
  scales: {
    x: {
      display: false,
      grid: {
        display: false,
      },
      border: {
        display: false,
      }
    },
    y: {
      display: false,
      grid: {
        display: false,
      },
      border: {
        display: false,
      },
      min: 'auto',
      max: 'auto',
      ticks: {
        stepSize: 1,
      },
    },
  },
  elements: {
    line: {
      tension: 0.35,
      borderWidth: 1.5,
      borderCapStyle: 'round' as const,
      borderJoinStyle: 'round' as const,
    },
    point: {
      radius: 0,
      hitRadius: 0,
      hoverRadius: 0,
    },
  },
};

const generateChartData = (data: number[], color: string): ChartData<'line'> => ({
  labels: new Array(data.length).fill(""),
  datasets: [
    {
      data,
      borderColor: color,
      backgroundColor: color,
      fill: false,
      tension: 0.35,
      borderWidth: 1.5,
      borderCapStyle: 'round' as const,
      borderJoinStyle: 'round' as const,
    },
  ],
});

const activeProjectsData = [15, 14.2, 13.8, 14.5, 14.2, 15, 16, 15.8, 16.8, 16.5, 17.8, 17.5, 18];
const websiteVisitsData = [630, 645, 635, 650, 645, 655, 650, 645, 650, 645, 642, 638, 635];
const newCustomersData = [3.2, 3.8, 3.5, 3.1, 2.8, 3.4, 3.9, 3.5, 3.3, 3.5, 3.8, 4];

export default function DashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Guest";

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-muted flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Good morning, {userName}!</h2>
          <p className="text-sm text-muted-foreground">{formattedDate}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
            })} - {new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-2 md:grid-cols-2">
        <Card className="p-6 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active projects
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <div>
              <div className="text-2xl font-bold">18</div>
              <div className="flex items-center pt-1 text-xs text-emerald-500">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                15% vs last month
              </div>
            </div>
            <div className="h-[80px] mt-6 bg-slate-50/50 rounded-lg">
              <Line
                data={generateChartData(activeProjectsData, "#10B981")}
                options={chartOptions}
              />
            </div>
            <button className="mt-2 text-sm text-muted-foreground hover:underline">
              View report
            </button>
          </CardContent>
        </Card>

        <Card className="p-6 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Website visits
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <div>
              <div className="text-2xl font-bold">654</div>
              <div className="flex items-center pt-1 text-xs text-red-500">
                <ArrowDownIcon className="h-4 w-4 mr-1" />
                17% vs last month
              </div>
            </div>
            <div className="h-[80px] mt-6 bg-slate-50/50 rounded-lg">
              <Line
                data={generateChartData(websiteVisitsData, "#EF4444")}
                options={chartOptions}
              />
            </div>
            <button className="mt-2 text-sm text-muted-foreground hover:underline">
              View report
            </button>
          </CardContent>
        </Card>

        <Card className="p-6 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New customers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <div>
              <div className="text-2xl font-bold">4</div>
              <div className="flex items-center pt-1 text-xs text-emerald-500">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                8% vs last month
              </div>
            </div>
            <div className="h-[80px] mt-6 bg-slate-50/50 rounded-lg">
              <Line
                data={generateChartData(newCustomersData, "#10B981")}
                options={chartOptions}
              />
            </div>
            <button className="mt-2 text-sm text-muted-foreground hover:underline">
              View report
            </button>
          </CardContent>
        </Card>

        <Card className="p-6 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              System types
            </CardTitle>
            <p className="text-sm font-medium text-muted-foreground">Distribution</p>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <div className="relative h-[200px] w-[200px] mx-auto mt-4">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="20"
                    strokeDasharray="188.5 251.3"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="20"
                    strokeDasharray="62.8 377"
                    strokeDashoffset="-188.5"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#14b8a6"
                    strokeWidth="20"
                    strokeDasharray="31.4 408.4"
                    strokeDashoffset="-251.3"
                  />
                </svg>
              </div>
            </div>
            <div className="space-y-1 mt-6">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-[#f97316] mr-2" />
                <span className="text-sm text-muted-foreground">Alarms</span>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-[#fbbf24] mr-2" />
                <span className="text-sm text-muted-foreground">Detectors</span>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-[#14b8a6] mr-2" />
                <span className="text-sm text-muted-foreground">Cabling</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
