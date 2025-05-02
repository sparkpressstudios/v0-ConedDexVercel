import { CheckCircle, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface SubmissionResultProps {
  result: any
  flavorId: string
  shopId?: string
}

export function SubmissionResult({ result, flavorId, shopId }: SubmissionResultProps) {
  const isAutoApproved = result?.autoApproved
  const needsReview = !isAutoApproved

  // Format the AI rarity for display
  const rarityColors = {
    Common: "bg-gray-100 text-gray-800",
    Uncommon: "bg-green-100 text-green-800",
    Rare: "bg-blue-100 text-blue-800",
    "Ultra Rare": "bg-purple-100 text-purple-800",
    Legendary: "bg-amber-100 text-amber-800",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          {isAutoApproved ? (
            <>
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              <span>Flavor Approved!</span>
            </>
          ) : (
            <>
              <Clock className="h-5 w-5 mr-2 text-yellow-500" />
              <span>Flavor Submitted for Review</span>
            </>
          )}
        </CardTitle>
        <CardDescription>
          {isAutoApproved
            ? "Your flavor has been automatically approved and added to the ConeDex."
            : "Your flavor has been submitted and is awaiting review by our team."}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {result?.rarity && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Rarity Classification</h3>
            <Badge className={rarityColors[result.rarity] || "bg-gray-100"}>{result.rarity}</Badge>
          </div>
        )}

        {result?.tags && result.tags.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Categories</h3>
            <div className="flex flex-wrap gap-1">
              {result.tags.map((tag, i) => (
                <Badge key={i} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {needsReview && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <h3 className="text-sm font-medium text-yellow-800 mb-1">Why does this need review?</h3>
            <p className="text-sm text-yellow-700">
              {result?.isDuplicate && result.duplicateConfidence > 0.8
                ? `This flavor appears similar to existing flavors like "${result.similarTo}".`
                : result?.contentIssues?.length > 0
                  ? "Our system detected potential content issues that need review."
                  : "Our system flagged this submission for manual review."}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between gap-2">
        <Button asChild variant="outline">
          <Link href={shopId ? `/dashboard/shop/flavors` : `/dashboard/flavors`}>Back to Flavors</Link>
        </Button>

        {isAutoApproved && (
          <Button asChild>
            <Link href={`/dashboard/flavors/${flavorId}`}>View in ConeDex</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
