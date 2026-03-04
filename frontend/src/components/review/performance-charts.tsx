"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Line,
  LineChart,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";

// --- Dummy Data ---

const WEEKLY_TASKS_DATA = [
  { day: "Mon", completed: 6, total: 8 },
  { day: "Tue", completed: 9, total: 10 },
  { day: "Wed", completed: 4, total: 7 },
  { day: "Thu", completed: 8, total: 9 },
  { day: "Fri", completed: 7, total: 8 },
  { day: "Sat", completed: 3, total: 4 },
  { day: "Sun", completed: 5, total: 6 },
];

const WEEKLY_FOCUS_DATA = [
  { day: "Mon", minutes: 120 },
  { day: "Tue", minutes: 180 },
  { day: "Wed", minutes: 90 },
  { day: "Thu", minutes: 150 },
  { day: "Fri", minutes: 140 },
  { day: "Sat", minutes: 60 },
  { day: "Sun", minutes: 100 },
];

const MONTHLY_COMPLETION_DATA = [
  { week: "Week 1", rate: 72 },
  { week: "Week 2", rate: 85 },
  { week: "Week 3", rate: 68 },
  { week: "Week 4", rate: 91 },
];

const NON_NEGOTIABLE_STREAK_DATA = [
  { day: "Mon", hit: 4, total: 4 },
  { day: "Tue", hit: 3, total: 4 },
  { day: "Wed", hit: 4, total: 4 },
  { day: "Thu", hit: 2, total: 4 },
  { day: "Fri", hit: 4, total: 4 },
  { day: "Sat", hit: 3, total: 4 },
  { day: "Sun", hit: 3, total: 4 },
];

// --- Chart Configs ---

const tasksChartConfig: ChartConfig = {
  completed: {
    label: "Completed",
    color: "hsl(var(--primary))",
  },
  total: {
    label: "Total",
    color: "hsl(var(--muted-foreground))",
  },
};

const focusChartConfig: ChartConfig = {
  minutes: {
    label: "Focus (min)",
    color: "hsl(var(--primary))",
  },
};

const completionChartConfig: ChartConfig = {
  rate: {
    label: "Completion %",
    color: "hsl(var(--primary))",
  },
};

const nnChartConfig: ChartConfig = {
  hit: {
    label: "Completed",
    color: "hsl(var(--primary))",
  },
  total: {
    label: "Total",
    color: "hsl(var(--muted-foreground))",
  },
};

// --- Components ---

function TasksCompletionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Tasks Completed (This Week)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={tasksChartConfig} className="h-50 w-full">
          <BarChart data={WEEKLY_TASKS_DATA} accessibilityLayer>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <YAxis tickLine={false} axisLine={false} fontSize={12} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="total"
              fill="var(--color-total)"
              radius={[4, 4, 0, 0]}
              opacity={0.3}
            />
            <Bar
              dataKey="completed"
              fill="var(--color-completed)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function FocusTimeChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Focus Time (This Week)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={focusChartConfig} className="h-50 w-full">
          <AreaChart data={WEEKLY_FOCUS_DATA} accessibilityLayer>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <YAxis tickLine={false} axisLine={false} fontSize={12} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-minutes)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-minutes)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="minutes"
              stroke="var(--color-minutes)"
              fill="url(#focusGradient)"
              strokeWidth={2}
              type="monotone"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function MonthlyCompletionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Monthly Completion Rate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={completionChartConfig} className="h-50 w-full">
          <LineChart data={MONTHLY_COMPLETION_DATA} accessibilityLayer>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={12}
              domain={[0, 100]}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              dataKey="rate"
              stroke="var(--color-rate)"
              strokeWidth={2}
              dot={{ fill: "var(--color-rate)", r: 4 }}
              type="monotone"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function NonNegotiableChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Non-Negotiables (This Week)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={nnChartConfig} className="h-50 w-full">
          <BarChart data={NON_NEGOTIABLE_STREAK_DATA} accessibilityLayer>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <YAxis tickLine={false} axisLine={false} fontSize={12} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="total"
              fill="var(--color-total)"
              radius={[4, 4, 0, 0]}
              opacity={0.3}
            />
            <Bar dataKey="hit" fill="var(--color-hit)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// --- Main Export ---

export function PerformanceCharts() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Performance
      </h3>

      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="weekly" className="flex-1">
            This Week
          </TabsTrigger>
          <TabsTrigger value="monthly" className="flex-1">
            This Month
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TasksCompletionChart />
            <FocusTimeChart />
          </div>
          <NonNegotiableChart />
        </TabsContent>

        <TabsContent value="monthly" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MonthlyCompletionChart />
            <TasksCompletionChart />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
