"use server"

import { createServerClient } from "@/lib/supabase/server"
import { puppeteerService } from "@/lib/utils/puppeteer-utils"
import path from "path"
import fs from "fs/promises"

interface FlavorCatalogOptions {
  shopId: string
  includeImages?: boolean
  includeDescriptions?: boolean
  includePricing?: boolean
  customTitle?: string
  customFooter?: string
}

/**
 * Generate a PDF flavor catalog for a shop
 */
export async function generateFlavorCatalog({
  shopId,
  includeImages = true,
  includeDescriptions = true,
  includePricing = false,
  customTitle,
  customFooter,
}: FlavorCatalogOptions): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Create output directory if it doesn't exist
    const outputDir = path.join(process.cwd(), "public", "catalogs")
    await fs.mkdir(outputDir, { recursive: true })

    // Generate unique filename
    const filename = `flavor-catalog-${shopId}-${Date.now()}.pdf`
    const outputPath = path.join(outputDir, filename)
    const publicUrl = `/catalogs/${filename}`

    // Get shop and flavor data
    const supabase = createServerClient()
    const { data: shop, error: shopError } = await supabase.from("shops").select("*").eq("id", shopId).single()

    if (shopError || !shop) {
      throw new Error(shopError?.message || "Shop not found")
    }

    const { data: flavors, error: flavorsError } = await supabase
      .from("shop_flavors")
      .select("*, flavor:flavors(*)")
      .eq("shop_id", shopId)
      .order("name")

    if (flavorsError) {
      throw new Error(flavorsError.message)
    }

    // Create a temporary HTML file for the catalog
    const catalogHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Flavor Catalog: ${shop.name}</title>
          <style>
            body { 
              font-family: 'Helvetica', 'Arial', sans-serif; 
              margin: 0; 
              padding: 0; 
              color: #333;
            }
            .header { 
              background-color: #f8f9fa; 
              padding: 20px; 
              text-align: center;
              border-bottom: 1px solid #e1e4e8;
            }
            h1 { 
              color: #3b82f6; 
              margin: 0;
              font-size: 28px;
            }
            .shop-info {
              font-size: 14px;
              color: #666;
              margin-top: 5px;
            }
            .content { 
              padding: 20px; 
            }
            .flavor-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
            }
            .flavor-card {
              border: 1px solid #e1e4e8;
              border-radius: 8px;
              overflow: hidden;
              break-inside: avoid;
            }
            .flavor-header {
              background-color: #f8f9fa;
              padding: 10px 15px;
              border-bottom: 1px solid #e1e4e8;
            }
            .flavor-name {
              margin: 0;
              font-size: 18px;
              color: #111;
            }
            .flavor-category {
              display: inline-block;
              background-color: #e1e4e8;
              color: #24292e;
              font-size: 12px;
              padding: 2px 8px;
              border-radius: 12px;
              margin-top: 5px;
            }
            .flavor-body {
              padding: 15px;
            }
            .flavor-image {
              width: 100%;
              height: 150px;
              object-fit: cover;
              margin-bottom: 10px;
              background-color: #f1f1f1;
            }
            .flavor-description {
              font-size: 14px;
              color: #444;
              margin-bottom: 10px;
            }
            .flavor-price {
              font-weight: bold;
              color: #0d6efd;
            }
            .footer {
              text-align: center;
              padding: 20px;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #e1e4e8;
              margin-top: 30px;
            }
            @media print {
              .flavor-grid { page-break-inside: avoid; }
              .flavor-card { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${customTitle || `Flavor Catalog: ${shop.name}`}</h1>
            <div class="shop-info">
              ${shop.address ? `<div>${shop.address}</div>` : ""}
              ${shop.phone ? `<div>${shop.phone}</div>` : ""}
              ${shop.website ? `<div>${shop.website}</div>` : ""}
            </div>
          </div>
          
          <div class="content">
            <div class="flavor-grid">
              ${
                flavors && flavors.length > 0
                  ? flavors
                      .map(
                        (item) => `
                <div class="flavor-card">
                  <div class="flavor-header">
                    <h3 class="flavor-name">${item.name || item.flavor?.name || "Unnamed Flavor"}</h3>
                    ${item.flavor?.category ? `<span class="flavor-category">${item.flavor.category}</span>` : ""}
                  </div>
                  <div class="flavor-body">
                    ${
                      includeImages && item.flavor?.image_url
                        ? `<img src="${item.flavor.image_url}" alt="${
                            item.name || item.flavor?.name || "Flavor"
                          }" class="flavor-image">`
                        : ""
                    }
                    ${
                      includeDescriptions && (item.description || item.flavor?.description)
                        ? `<p class="flavor-description">${item.description || item.flavor?.description}</p>`
                        : ""
                    }
                    ${
                      includePricing && item.price
                        ? `<p class="flavor-price">$${Number.parseFloat(item.price).toFixed(2)}</p>`
                        : ""
                    }
                  </div>
                </div>
              `,
                      )
                      .join("")
                  : "<p>No flavors available</p>"
              }
            </div>
          </div>
          
          <div class="footer">
            ${
              customFooter || `Generated by ConeDex on ${new Date().toLocaleDateString()} | ${shop.name} Flavor Catalog`
            }
          </div>
        </body>
      </html>
    `

    const tempHtmlPath = path.join(outputDir, `temp-catalog-${shopId}.html`)
    await fs.writeFile(tempHtmlPath, catalogHtml)

    // Generate PDF from the HTML file
    const tempHtmlUrl = `file://${tempHtmlPath}`
    await puppeteerService.generatePDF(tempHtmlUrl, outputPath, {
      format: "A4",
      printBackground: true,
    })

    // Clean up temporary HTML file
    await fs.unlink(tempHtmlPath)

    // Return the public URL to the PDF
    return {
      success: true,
      url: publicUrl,
    }
  } catch (error) {
    console.error("Error generating flavor catalog:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error generating flavor catalog",
    }
  } finally {
    // Always close the browser
    await puppeteerService.closeBrowser()
  }
}
