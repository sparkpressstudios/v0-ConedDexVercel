import type { Page } from "puppeteer"
import { puppeteerService } from "./puppeteer-utils"

/**
 * Scrape ice cream shop data from a directory website
 */
export async function scrapeIceCreamShops(url: string): Promise<any[]> {
  try {
    const shops = await puppeteerService.scrapeData(url, async (page: Page) => {
      // This is a simplified example. In a real implementation,
      // you would need to adapt this to the specific structure of the website.
      return await page.evaluate(() => {
        const shopElements = document.querySelectorAll(".shop-listing")

        return Array.from(shopElements).map((element) => {
          const nameElement = element.querySelector(".shop-name")
          const addressElement = element.querySelector(".shop-address")
          const phoneElement = element.querySelector(".shop-phone")
          const websiteElement = element.querySelector(".shop-website")

          return {
            name: nameElement ? nameElement.textContent?.trim() : null,
            address: addressElement ? addressElement.textContent?.trim() : null,
            phone: phoneElement ? phoneElement.textContent?.trim() : null,
            website: websiteElement ? (websiteElement as HTMLAnchorElement).href : null,
          }
        })
      })
    })

    return shops
  } finally {
    await puppeteerService.closeBrowser()
  }
}

/**
 * Scrape flavor information from an ice cream shop's website
 */
export async function scrapeShopFlavors(url: string): Promise<any[]> {
  try {
    const flavors = await puppeteerService.scrapeData(url, async (page: Page) => {
      // This is a simplified example. In a real implementation,
      // you would need to adapt this to the specific structure of the website.
      return await page.evaluate(() => {
        const flavorElements = document.querySelectorAll(".flavor-item")

        return Array.from(flavorElements).map((element) => {
          const nameElement = element.querySelector(".flavor-name")
          const descriptionElement = element.querySelector(".flavor-description")
          const categoryElement = element.querySelector(".flavor-category")

          return {
            name: nameElement ? nameElement.textContent?.trim() : null,
            description: descriptionElement ? descriptionElement.textContent?.trim() : null,
            category: categoryElement ? categoryElement.textContent?.trim() : null,
          }
        })
      })
    })

    return flavors
  } finally {
    await puppeteerService.closeBrowser()
  }
}
