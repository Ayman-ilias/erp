"use client";

import { WorkflowBoard } from "@/components/workflow/WorkflowBoard";
import { useSearchParams } from "next/navigation";

/**
 * Workflow Board Page
 *
 * Displays a Kanban-style board with workflow cards organized by status.
 * Requirements: 3.1, 3.2, 3.4 (Board Layout and Card Display)
 */
export default function WorkflowBoardPage() {
  const searchParams = useSearchParams();
  const workflowId = searchParams.get("workflow_id");

  return <WorkflowBoard workflowId={workflowId ? parseInt(workflowId) : undefined} />;
}
