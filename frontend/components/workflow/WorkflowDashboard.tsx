"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { workflowService } from "@/services/api";
import { toast } from "sonner";
import {
  Activity, AlertCircle, CheckCircle2, Clock, Filter,
  Layers, RefreshCw, Search, TrendingUp, Users, XCircle
} from "lucide-react";

interface WorkflowStats {
  total_workflows: number;
  active_workflows: number;
  completed_workflows: number;
  cancelled_workflows: number;
  total_cards: number;
  card_status_counts: Record<string, number>;
  blocked_cards: number;
  overdue_workflows: number;
  priority_distribution: Record<string, number>;
  avg_completion_days: number;
  recent_workflows: number;
  stage_breakdown: Record<string, Record<string, number>>;
  workload_distribution: Record<string, number>;
  completion_rate: number;
}

interface Workflow {
  id: number;
  workflow_name: string;
  workflow_status: string;
  priority: string;
  created_at: string;
  due_date: string | null;
  sample_request_id: number;
  cards?: any[];
}

export function WorkflowDashboard() {
  const [stats, setStats] = useState<WorkflowStats | null>(null);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [filteredWorkflows, setFilteredWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [workflows, statusFilter, priorityFilter, searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, workflowsData] = await Promise.all([
        workflowService.getStatistics(),
        workflowService.getWorkflows()
      ]);
      setStats(statsData);
      setWorkflows(Array.isArray(workflowsData) ? workflowsData : []);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success("Dashboard refreshed");
  };

  const applyFilters = () => {
    let filtered = [...workflows];

    if (statusFilter !== "all") {
      filtered = filtered.filter(w => w.workflow_status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(w => w.priority === priorityFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(w =>
        w.workflow_name.toLowerCase().includes(query) ||
        w.id.toString().includes(query)
      );
    }

    setFilteredWorkflows(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "active": return "bg-blue-500";
      case "cancelled": return "bg-gray-500";
      case "blocked": return "bg-red-500";
      default: return "bg-yellow-500";
    }
  };

  const getPriorityVariant = (priority: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "default";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflow Dashboard</h1>
          <p className="text-muted-foreground">Overview of all sample development workflows</p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_workflows || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.recent_workflows || 0} in last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active_workflows || 0}</div>
            <Progress
              value={stats?.total_workflows ? (stats.active_workflows / stats.total_workflows) * 100 : 0}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completion_rate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {stats?.completed_workflows || 0} completed workflows
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Completion Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avg_completion_days || 0} days</div>
            <p className="text-xs text-muted-foreground">Average time to complete</p>
          </CardContent>
        </Card>
      </div>

      {/* Alert Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className={stats?.blocked_cards ? "border-red-200 bg-red-50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Tasks</CardTitle>
            <AlertCircle className={`h-4 w-4 ${stats?.blocked_cards ? "text-red-500" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats?.blocked_cards ? "text-red-600" : ""}`}>
              {stats?.blocked_cards || 0}
            </div>
            <p className="text-xs text-muted-foreground">Tasks requiring attention</p>
          </CardContent>
        </Card>

        <Card className={stats?.overdue_workflows ? "border-orange-200 bg-orange-50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Workflows</CardTitle>
            <XCircle className={`h-4 w-4 ${stats?.overdue_workflows ? "text-orange-500" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats?.overdue_workflows ? "text-orange-600" : ""}`}>
              {stats?.overdue_workflows || 0}
            </div>
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>
      </div>

      {/* Card Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Task Status Distribution</CardTitle>
          <CardDescription>Current status of all workflow cards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {["pending", "ready", "in_progress", "completed", "blocked"].map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium capitalize">{status.replace("_", " ")}</p>
                  <p className="text-2xl font-bold">{stats?.card_status_counts?.[status] || 0}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Priority Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Priority Distribution</CardTitle>
          <CardDescription>Workflows by priority level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {["high", "medium", "low"].map((priority) => (
              <div key={priority} className="flex items-center gap-2">
                <Badge variant={getPriorityVariant(priority)} className="capitalize">
                  {priority}
                </Badge>
                <span className="text-lg font-semibold">{stats?.priority_distribution?.[priority] || 0}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workload Distribution */}
      {stats?.workload_distribution && Object.keys(stats.workload_distribution).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Assignee Workload
            </CardTitle>
            <CardDescription>Active tasks per team member</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-4">
              {Object.entries(stats.workload_distribution).map(([assignee, count]) => (
                <div key={assignee} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium">{assignee}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stage Breakdown */}
      {stats?.stage_breakdown && Object.keys(stats.stage_breakdown).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Stage Analysis</CardTitle>
            <CardDescription>Status distribution by workflow stage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.stage_breakdown).map(([stage, statuses]) => (
                <div key={stage} className="space-y-2">
                  <p className="text-sm font-medium">{stage}</p>
                  <div className="flex gap-2">
                    {Object.entries(statuses).map(([status, count]) => (
                      <Badge key={status} variant="outline" className="text-xs">
                        <span className={`w-2 h-2 rounded-full mr-1 ${getStatusColor(status)}`} />
                        {status}: {count}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Workflow List
          </CardTitle>
          <CardDescription>Filter and search workflows</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Workflows List */}
          <div className="space-y-2">
            {filteredWorkflows.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No workflows found</p>
            ) : (
              filteredWorkflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(workflow.workflow_status)}`} />
                    <div>
                      <p className="font-medium">{workflow.workflow_name}</p>
                      <p className="text-xs text-muted-foreground">
                        ID: {workflow.id} | Created: {new Date(workflow.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityVariant(workflow.priority)} className="capitalize">
                      {workflow.priority}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {workflow.workflow_status}
                    </Badge>
                    {workflow.due_date && (
                      <span className="text-xs text-muted-foreground">
                        Due: {new Date(workflow.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Showing {filteredWorkflows.length} of {workflows.length} workflows
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default WorkflowDashboard;
