import * as Tabs from "@radix-ui/react-tabs";
import { Shield, Building2, Link2, Key, Plug } from "lucide-react";
import { useHasPermission } from "@/auth/hooks";
import { OrgConfig } from "./org-config";
import { OdooStatusCard } from "./odoo-status";
import { WebhooksManager } from "./webhooks";
import { ApiKeysManager } from "./api-keys";

const tabs = [
  { value: "organization", label: "Organization", icon: Building2 },
  { value: "odoo", label: "Odoo", icon: Plug },
  { value: "webhooks", label: "Webhooks", icon: Link2 },
  { value: "api-keys", label: "API Keys", icon: Key },
] as const;

export function SettingsPage() {
  const canAccess = useHasPermission("settings:write");

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Shield className="h-12 w-12 mb-4" />
        <h2 className="text-lg font-semibold">Access Denied</h2>
        <p className="text-sm">You need the settings:write permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage organization configuration, integrations, and API access
        </p>
      </div>

      <Tabs.Root defaultValue="organization">
        <Tabs.List className="flex border-b border-gray-200">
          {tabs.map(({ value, label, icon: Icon }) => (
            <Tabs.Trigger
              key={value}
              value={value}
              className="flex items-center gap-2 border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <div className="pt-6">
          <Tabs.Content value="organization">
            <OrgConfig />
          </Tabs.Content>
          <Tabs.Content value="odoo">
            <OdooStatusCard />
          </Tabs.Content>
          <Tabs.Content value="webhooks">
            <WebhooksManager />
          </Tabs.Content>
          <Tabs.Content value="api-keys">
            <ApiKeysManager />
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </div>
  );
}
