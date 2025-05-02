import type { Page } from "puppeteer"
import { puppeteerService } from "@/lib/utils/puppeteer-utils"

/**
 * Run automated UI tests for the ConeDex platform
 */
export async function runUiTests() {
  try {
    const results = {
      homePage: await testHomePage(),
      loginFlow: await testLoginFlow(),
      flavorBrowsing: await testFlavorBrowsing(),
      responsiveness: await testResponsiveness(),
    }

    const allPassed = Object.values(results).every((result) => result.success)

    return {
      allPassed,
      results,
    }
  } finally {
    await puppeteerService.closeBrowser()
  }
}

/**
 * Test the home page
 */
async function testHomePage(): Promise<{ success: boolean; message: string }> {
  try {
    await puppeteerService.runTests("http://localhost:3000", async (page: Page) => {
      // Check if the page title is correct
      const title = await page.title()
      if (!title.includes("ConeDex")) {
        throw new Error(`Incorrect page title: ${title}`)
      }

      // Check if the navigation links are present
      const navLinks = await page.$$eval("nav a", (links) => links.map((link) => link.textContent?.trim()))

      const requiredLinks = ["Features", "Pricing", "Business"]
      for (const link of requiredLinks) {
        if (!navLinks.some((navLink) => navLink?.includes(link))) {
          throw new Error(`Missing navigation link: ${link}`)
        }
      }

      // Check if the hero section is present
      const heroHeading = await page.$eval("h1", (el) => el.textContent)
      if (!heroHeading) {
        throw new Error("Hero heading not found")
      }

      // Take a screenshot for visual verification
      await page.screenshot({ path: "./public/test-results/home-page.png" })
    })

    return { success: true, message: "Home page test passed" }
  } catch (error) {
    console.error("Home page test failed:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error in home page test",
    }
  }
}

/**
 * Test the login flow
 */
async function testLoginFlow(): Promise<{ success: boolean; message: string }> {
  try {
    await puppeteerService.runTests("http://localhost:3000/login", async (page: Page) => {
      // Check if login form is present
      const emailInput = await page.$('input[type="email"]')
      const passwordInput = await page.$('input[type="password"]')
      const loginButton = await page.$('button[type="submit"]')

      if (!emailInput || !passwordInput || !loginButton) {
        throw new Error("Login form elements not found")
      }

      // Fill in demo credentials
      await emailInput.type("explorer@conedex.app")
      await passwordInput.type("explorer123")

      // Take screenshot before submission
      await page.screenshot({ path: "./public/test-results/login-form-filled.png" })

      // Submit the form
      await loginButton.click()

      // Wait for navigation to complete
      await page.waitForNavigation({ waitUntil: "networkidle2" })

      // Check if we're redirected to the dashboard
      const currentUrl = page.url()
      if (!currentUrl.includes("/dashboard")) {
        throw new Error(`Login failed, redirected to: ${currentUrl}`)
      }

      // Take screenshot after login
      await page.screenshot({ path: "./public/test-results/after-login.png" })
    })

    return { success: true, message: "Login flow test passed" }
  } catch (error) {
    console.error("Login flow test failed:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error in login flow test",
    }
  }
}

/**
 * Test flavor browsing functionality
 */
async function testFlavorBrowsing(): Promise<{ success: boolean; message: string }> {
  try {
    await puppeteerService.runTests("http://localhost:3000/dashboard/flavors", async (page: Page) => {
      // Wait for flavor cards to load
      await page.waitForSelector('[data-testid="flavor-card"]', { timeout: 5000 })

      // Check if flavor cards are present
      const flavorCards = await page.$$('[data-testid="flavor-card"]')
      if (flavorCards.length === 0) {
        throw new Error("No flavor cards found")
      }

      // Click on the first flavor card
      await flavorCards[0].click()

      // Wait for flavor details page to load
      await page.waitForNavigation({ waitUntil: "networkidle2" })

      // Check if we're on a flavor details page
      const flavorTitle = await page.$("h1")
      if (!flavorTitle) {
        throw new Error("Flavor details page not loaded correctly")
      }

      // Take screenshot of flavor details
      await page.screenshot({ path: "./public/test-results/flavor-details.png" })
    })

    return { success: true, message: "Flavor browsing test passed" }
  } catch (error) {
    console.error("Flavor browsing test failed:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error in flavor browsing test",
    }
  }
}

/**
 * Test responsiveness across different device sizes
 */
async function testResponsiveness(): Promise<{ success: boolean; message: string }> {
  try {
    const devices = [
      { name: "Mobile", width: 375, height: 667 },
      { name: "Tablet", width: 768, height: 1024 },
      { name: "Desktop", width: 1440, height: 900 },
    ]

    for (const device of devices) {
      await puppeteerService.takeScreenshot(
        "http://localhost:3000",
        `./public/test-results/responsive-${device.name.toLowerCase()}.png`,
        {
          width: device.width,
          height: device.height,
          fullPage: true,
        },
      )
    }

    return { success: true, message: "Responsiveness test passed" }
  } catch (error) {
    console.error("Responsiveness test failed:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error in responsiveness test",
    }
  }
}
