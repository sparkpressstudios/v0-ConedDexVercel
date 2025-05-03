"use client"

import { Button } from "@/components/ui/button"
import { loginAsAdmin, loginAsExplorer, loginAsShopOwner } from "@/app/actions/auth-actions"

export default function LoginButtons() {
  return (
    <div className="grid gap-2">
      <form action={loginAsAdmin}>
        <Button type="submit" variant="outline" className="w-full">
          Login as Admin
        </Button>
      </form>
      <form action={loginAsExplorer}>
        <Button type="submit" variant="outline" className="w-full">
          Login as Ice Cream Explorer
        </Button>
      </form>
      <form action={loginAsShopOwner}>
        <Button type="submit" variant="outline" className="w-full">
          Login as Shop Owner
        </Button>
      </form>
    </div>
  )
}
