"use client";

import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { hasDepartmentAccess, DEPARTMENTS, MENU_TO_DEPARTMENT } from "@/lib/permissions";

export default function DebugPermissionsPage() {
  const { user } = useAuth();

  if (!user) {
    return <div className="p-8">Not logged in</div>;
  }

  const merchandisingAccess = hasDepartmentAccess(user, DEPARTMENTS.MERCHANDISING);

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Debug: User Permissions</h1>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div><strong>Username:</strong> {user.username}</div>
          <div><strong>Email:</strong> {user.email}</div>
          <div>
            <strong>Is Superuser:</strong>{" "}
            <Badge variant={user.is_superuser ? "default" : "secondary"}>
              {user.is_superuser ? "YES" : "NO"}
            </Badge>
          </div>
          <div><strong>Department:</strong> {user.department}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Department Access Array</CardTitle>
        </CardHeader>
        <CardContent>
          <div><strong>Length:</strong> {user.department_access?.length || 0}</div>
          <div><strong>Contents:</strong></div>
          <pre className="bg-muted p-4 rounded mt-2 overflow-auto">
            {JSON.stringify(user.department_access, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Merchandising Access Check</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <strong>Department ID:</strong> {DEPARTMENTS.MERCHANDISING}
          </div>
          <div>
            <strong>Has Access:</strong>{" "}
            <Badge variant={merchandisingAccess ? "default" : "destructive"}>
              {merchandisingAccess ? "YES ✓" : "NO ✗"}
            </Badge>
          </div>
          <div>
            <strong>Menu Title Mapping:</strong> {MENU_TO_DEPARTMENT["Merchandising"]}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Department Access Checks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {Object.entries(DEPARTMENTS).map(([key, deptId]) => (
              <div key={key} className="flex items-center justify-between">
                <span>{key} ({deptId}):</span>
                <Badge variant={hasDepartmentAccess(user, deptId) ? "default" : "secondary"}>
                  {hasDepartmentAccess(user, deptId) ? "✓ Access" : "✗ No Access"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Raw User Object</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded overflow-auto text-xs">
            {JSON.stringify(user, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

