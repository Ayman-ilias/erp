"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from "@/components/ui/sidebar";
import {
  ArchiveRestoreIcon,
  Building2Icon,
  CalendarIcon,
  ChartPieIcon,
  ChevronRight,
  ClipboardCheckIcon,
  FolderDotIcon,
  SettingsIcon,
  ShoppingBagIcon,
  UsersIcon,
  ContactIcon,
  ShipIcon,
  LandmarkIcon,
  CalculatorIcon,
  PackageIcon,
  PaletteIcon,
  BoxIcon,
  FileTextIcon,
  ShieldIcon,
  GlobeIcon,
  CircleDollarSignIcon,
  PercentIcon,
  NetworkIcon,
  RulerIcon,
  WarehouseIcon,
  HashIcon,
  CalendarDaysIcon,
  ClockIcon,
  BookOpenIcon,
  MapPinIcon,
  CogIcon,
  WrenchIcon,
  ClipboardListIcon
} from "lucide-react";
import Link from "next/link";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { isMenuItemVisible, MENU_TO_DEPARTMENT, hasDepartmentAccess } from "@/lib/permissions";

/**
 * Navigation items configuration
 * Uses global NavGroup and NavItem types from types.d.ts
 */
export const navItems: NavGroup[] = [
  {
    title: "Main Menu",
    items: [
      {
        title: "Client Info",
        href: "#",
        icon: UsersIcon,
        items: [
          {
            title: "Buyer Info",
            href: "/dashboard/erp/clients/buyers",
            icon: UsersIcon
          },
          {
            title: "Supplier Info",
            href: "/dashboard/erp/clients/suppliers",
            icon: Building2Icon
          },
          {
            title: "Contact Info",
            href: "/dashboard/erp/clients/contacts",
            icon: ContactIcon
          },
          {
            title: "Shipping Info",
            href: "/dashboard/erp/clients/shipping",
            icon: ShipIcon
          },
          {
            title: "Banking Info",
            href: "/dashboard/erp/clients/banking",
            icon: LandmarkIcon
          }
        ]
      },
      {
        title: "Sample Department",
        href: "#",
        icon: ClipboardCheckIcon,
        items: [
          {
            title: "Sample Request",
            href: "/dashboard/erp/samples/requests",
            icon: ClipboardListIcon
          },
          {
            title: "Sample Plan",
            href: "/dashboard/erp/samples/plan",
            icon: ShoppingBagIcon
          },
          {
            title: "Add Sample Material",
            href: "/dashboard/erp/samples/required-materials",
            icon: BoxIcon
          },
          {
            title: "Add New Manufacturing Operations",
            href: "/dashboard/erp/samples/manufacturing-operations",
            icon: WrenchIcon
          },
          {
            title: "Add Operations For Sample",
            href: "/dashboard/erp/samples/operations",
            icon: SettingsIcon
          },
          {
            title: "Sample TNA",
            href: "/dashboard/erp/samples/tna",
            icon: CalendarIcon
          },
          {
            title: "Sample Status",
            href: "/dashboard/erp/samples/status",
            icon: ClipboardCheckIcon
          },
          {
            title: "Required Material (Style Variant)",
            href: "/dashboard/erp/samples/variant-materials",
            icon: PackageIcon
          },
          {
            title: "SMV Calculation",
            href: "/dashboard/erp/samples/smv",
            icon: CalculatorIcon
          }
        ]
      },
      {
        title: "Merchandising",
        href: "#",
        icon: PaletteIcon,
        items: [
          {
            title: "Material Details",
            href: "/dashboard/erp/merchandising/material-details",
            icon: PackageIcon
          },
          {
            title: "Size Details",
            href: "/dashboard/erp/merchandising/size-details",
            icon: FileTextIcon
          },
          {
            title: "Sample Development",
            href: "/dashboard/erp/merchandising/sample-development",
            icon: ClipboardCheckIcon
          },
          {
            title: "Style Management",
            href: "/dashboard/erp/merchandising/style-management",
            icon: PaletteIcon
          }
        ]
      },
      {
        title: "Order Info",
        href: "#",
        icon: FolderDotIcon,
        items: [
          {
            title: "Orders",
            href: "/dashboard/erp/orders",
            icon: FolderDotIcon
          },
          {
            title: "Production Planning",
            href: "/dashboard/erp/production",
            icon: CalendarIcon
          },
          {
            title: "Store & Inventory",
            href: "/dashboard/erp/inventory",
            icon: ArchiveRestoreIcon
          },
          {
            title: "Reports",
            href: "/dashboard/erp/reports",
            icon: ChartPieIcon
          }
        ]
      },
      {
        title: "Basic Settings",
        href: "#",
        icon: SettingsIcon,
        isAdminOnly: true,
        items: [
          {
            title: "Company Profile",
            href: "/dashboard/erp/settings/company-profile",
            icon: Building2Icon
          },
          {
            title: "Branches",
            href: "/dashboard/erp/settings/branches",
            icon: MapPinIcon
          },
          {
            title: "Users",
            href: "/dashboard/erp/settings/users",
            icon: UsersIcon
          },
          {
            title: "Roles & Permissions",
            href: "/dashboard/erp/settings/roles",
            icon: ShieldIcon
          },
          {
            title: "Chart of Accounts",
            href: "/dashboard/erp/settings/accounts",
            icon: BookOpenIcon
          },
          {
            title: "Currencies",
            href: "/dashboard/erp/settings/currencies",
            icon: CircleDollarSignIcon
          },
          {
            title: "Taxes",
            href: "/dashboard/erp/settings/taxes",
            icon: PercentIcon
          },
          {
            title: "Departments",
            href: "/dashboard/erp/settings/departments",
            icon: NetworkIcon
          },
          {
            title: "Units of Measure",
            href: "/dashboard/erp/settings/uom",
            icon: RulerIcon
          },
          {
            title: "Colour Master",
            href: "/dashboard/erp/settings/colors",
            icon: PaletteIcon
          },
          {
            title: "Warehouses",
            href: "/dashboard/erp/settings/warehouses",
            icon: WarehouseIcon
          },
          {
            title: "Document Numbering",
            href: "/dashboard/erp/settings/document-numbering",
            icon: HashIcon
          },
          {
            title: "Fiscal Year",
            href: "/dashboard/erp/settings/fiscal-year",
            icon: CalendarDaysIcon
          },
          {
            title: "Country Master",
            href: "/dashboard/erp/settings/countries",
            icon: GlobeIcon
          },
          {
            title: "Per Minute Value",
            href: "/dashboard/erp/settings/per-minute-value",
            icon: ClockIcon
          }
        ]
      }
    ]
  }
];

export function NavMain() {
  const pathname = usePathname();
  const { isMobile } = useSidebar();
  const { user } = useAuth();

  /**
   * Filter nav items based on user permissions
   * Uses centralized permission utilities from @/lib/permissions
   */
  const getFilteredNavItems = (): NavGroup[] => {
    if (!user) return [];

    return navItems.map((nav) => ({
      ...nav,
      items: nav.items
        .map((item) => {
          // Check if user has access to this menu item
          if (!isMenuItemVisible(user, item.title, item.isAdminOnly)) {
            return null;
          }

          // For items with sub-items (dropdown menus)
          if (item.items && Array.isArray(item.items)) {
            // Filter sub-items based on their specific department access
            const filteredSubItems = item.items.filter((subItem) => {
              // Get department for sub-item if it has specific routing
              const subDeptId = MENU_TO_DEPARTMENT[subItem.title];
              if (subDeptId) {
                return hasDepartmentAccess(user, subDeptId);
              }
              // Sub-items inherit parent's department access by default
              return true;
            });

            // If all sub-items are filtered out, hide the parent
            if (filteredSubItems.length === 0) {
              return null;
            }

            return {
              ...item,
              items: filteredSubItems
            };
          }

          return item;
        })
        .filter((item): item is NavItem => item !== null)
    }));
  };

  const filteredNavItems = getFilteredNavItems();

  return (
    <>
      {filteredNavItems.map((nav) => (
        <SidebarGroup key={nav.title}>
          <SidebarGroupLabel>{nav.title}</SidebarGroupLabel>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              {nav.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {Array.isArray(item.items) && item.items.length > 0 ? (
                    <>
                      {/* Collapsed state - Dropdown */}
                      <div className="hidden group-data-[collapsible=icon]:block">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <SidebarMenuButton tooltip={item.title}>
                              {item.icon && <item.icon />}
                              <span>{item.title}</span>
                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            side={isMobile ? "bottom" : "right"}
                            align={isMobile ? "end" : "start"}
                            className="min-w-48 rounded-lg"
                          >
                            <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
                            {item.items?.map((subItem) => (
                              <DropdownMenuItem
                                className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10! active:bg-[var(--primary)]/10!"
                                asChild
                                key={subItem.title}
                              >
                                <a href={subItem.href}>{subItem.title}</a>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Expanded state - Collapsible */}
                      <Collapsible className="group/collapsible block group-data-[collapsible=icon]:hidden">
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                            tooltip={item.title}
                          >
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items?.map((subItem, key) => (
                              <SidebarMenuSubItem key={key}>
                                <SidebarMenuSubButton
                                  className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                                  isActive={pathname === subItem.href}
                                  asChild
                                >
                                  <Link
                                    href={subItem.href}
                                    target={subItem.newTab ? "_blank" : ""}
                                  >
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    </>
                  ) : (
                    /* Single link item (no sub-items) */
                    <SidebarMenuButton
                      className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                      isActive={pathname === item.href}
                      tooltip={item.title}
                      asChild
                    >
                      <Link href={item.href} target={item.newTab ? "_blank" : ""}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}

                  {/* Badges */}
                  {!!item.isComing && (
                    <SidebarMenuBadge className="peer-hover/menu-button:text-foreground opacity-50">
                      Coming
                    </SidebarMenuBadge>
                  )}
                  {!!item.isNew && (
                    <SidebarMenuBadge className="border border-green-400 text-green-600 peer-hover/menu-button:text-green-600">
                      New
                    </SidebarMenuBadge>
                  )}
                  {!!item.isDataBadge && (
                    <SidebarMenuBadge className="peer-hover/menu-button:text-foreground">
                      {item.isDataBadge}
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
