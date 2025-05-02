import { CheckCircle, Clock, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface VerificationBadgeProps {
  status: "verified" | "pending" | "rejected" | "unverified"
  showTooltip?: boolean
  className?: string
}

export function VerificationBadge({ status, showTooltip = true, className = "" }: VerificationBadgeProps) {
  const badgeContent = () => {
    switch (status) {
      case "verified":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700">
            <CheckCircle className="mr-1 h-3 w-3" />
            Verified
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50 hover:text-yellow-700">
            <Clock className="mr-1 h-3 w-3" />
            Pending Verification
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50 hover:text-red-700">
            <XCircle className="mr-1 h-3 w-3" />
            Verification Rejected
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50 hover:text-gray-700">
            Unverified
          </Badge>
        )
    }
  }

  const tooltipContent = () => {
    switch (status) {
      case "verified":
        return "This shop has been verified by ConeDex"
      case "pending":
        return "Verification is in progress"
      case "rejected":
        return "Verification was rejected"
      default:
        return "This shop has not been verified"
    }
  }

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={className}>{badgeContent()}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipContent()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return <span className={className}>{badgeContent()}</span>
}
