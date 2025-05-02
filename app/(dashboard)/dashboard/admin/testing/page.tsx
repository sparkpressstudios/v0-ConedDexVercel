import { PuppeteerTestRunner } from "@/components/admin/testing/puppeteer-test-runner"
import { VisualRegressionTester } from "@/components/admin/testing/visual-regression-tester"
import { PerformanceTestRunner } from "@/components/admin/testing/performance-test-runner"
import { IntegrationTestRunner } from "@/components/admin/testing/integration-test-runner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TestingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Testing Dashboard</h1>
        <p className="text-muted-foreground">Run automated tests to ensure platform stability</p>
      </div>

      <Tabs defaultValue="ui">
        <TabsList>
          <TabsTrigger value="ui">UI Tests</TabsTrigger>
          <TabsTrigger value="visual">Visual Regression</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="integration">Integration Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="ui" className="space-y-4">
          <PuppeteerTestRunner />
        </TabsContent>

        <TabsContent value="visual" className="space-y-4">
          <VisualRegressionTester />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <PerformanceTestRunner />
        </TabsContent>

        <TabsContent value="integration" className="space-y-4">
          <IntegrationTestRunner />
        </TabsContent>
      </Tabs>
    </div>
  )
}
