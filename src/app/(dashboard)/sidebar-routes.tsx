"use client";

import { CreditCard, Crown, Home, MessageCircleQuestion, FolderKanban, LayoutDashboard, Rocket, Receipt, Package, Calendar } from "lucide-react";
import { usePathname } from "next/navigation";

import { usePaywall } from "@/features/subscriptions/hooks/use-paywall";
import { useCheckout } from "@/features/subscriptions/api/use-checkout";
import { useBilling } from "@/features/subscriptions/api/use-billing";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { SidebarItem } from "./sidebar-item";

export const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Projects",
    icon: FolderKanban,
    href: "/projects",
  },
  {
    label: "Takeoffs",
    icon: Rocket,
    href: "/takeoffs",
  },
  {
    label: "Invoices",
    icon: Receipt,
    href: "/invoices",
  },
  {
    label: "Calendar",
    icon: Calendar,
    href: "/calendar",
  },
  {
    label: "Inventory",
    icon: Package,
    href: "/inventory",
  },
];

export const SidebarRoutes = () => {
  const mutation = useCheckout();
  const billingMutation = useBilling();
  const { shouldBlock, isLoading, triggerPaywall } = usePaywall();

  const pathname = usePathname();

  const onClick = () => {
    if (shouldBlock) {
      triggerPaywall();
      return;
    }

    billingMutation.mutate();
  };

  return (
    <div className="flex flex-col gap-y-4 flex-1">
      {shouldBlock && !isLoading && (
        <>
          <div className="px-3">
            <Button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="w-full rounded-xl border-none hover:bg-white hover:opacity-75 transition text-black"
              variant="outline"
              size="lg"
            >
              <Crown className="mr-2 size-4 fill-black text-black" />
              Upgrade to Pro
            </Button>
          </div>
          <div className="px-3">
            <Separator />
          </div>
        </>
      )}
      <ul className="flex flex-col gap-y-1 px-3">
        {/* <SidebarItem href="/" icon={Home} label="Home" isActive={pathname === "/"} /> */}
        {routes.map((route) => (
          <SidebarItem key={route.href} href={route.href} icon={route.icon} label={route.label} isActive={pathname === route.href} />
        ))}
      </ul>
      <div className="px-3">
        <Separator />
      </div>
      <ul className="flex flex-col gap-y-1 px-3">
        <SidebarItem href={pathname} icon={CreditCard} label="Billing" onClick={onClick} />
        <SidebarItem
          href="mailto:support@example.com"
          icon={MessageCircleQuestion}
          label="Get Help"
        />
      </ul>
    </div>
  );
};
