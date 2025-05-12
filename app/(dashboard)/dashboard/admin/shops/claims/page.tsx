import { ShopClaimsManager } from "@/components/admin/shop-claims-manager"

export default function ShopClaimsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Shop Claims</h1>
        <p className="text-muted-foreground">Review and manage shop ownership claim requests</p>
      </div>

      <ShopClaimsManager />
    </div>
  )
}
