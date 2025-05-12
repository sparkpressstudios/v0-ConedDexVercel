"use server"

import { headers } from "next/headers"

// Add the missing isMapsApiConfigured function
export async function isMapsApiConfigured() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  return !!apiKey
}

// Function to get the Google Maps API URL with the API key
export async function getMapsApiUrl(libraries: string[] = ["places"]) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    throw new Error("Google Maps API key is not defined")
  }

  const librariesParam = libraries.join(",")
  return `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${librariesParam}&callback=initMap`
}

// Function to get the Google Places API URL with the API key
export async function getPlacesApiUrl(query: string, location?: string, radius?: number) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    throw new Error("Google Maps API key is not defined")
  }

  let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`

  if (location) {
    url += `&location=${encodeURIComponent(location)}`
  }

  if (radius) {
    url += `&radius=${radius}`
  }

  return url
}

// Function to get the Google Places Details API URL with the API key
export async function getPlaceDetailsApiUrl(placeId: string) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    throw new Error("Google Maps API key is not defined")
  }

  return `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`
}

// Function to get the Google Places Photo API URL with the API key
export async function getPlacePhotoApiUrl(photoReference: string, maxWidth = 400) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    throw new Error("Google Maps API key is not defined")
  }

  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${apiKey}`
}

// Function to get the referer header
export async function getReferer() {
  const headersList = headers()
  return headersList.get("referer") || ""
}

// Function to search for places
export async function searchPlaces(query: string, location?: string, radius?: number) {
  const url = await getPlacesApiUrl(query, location, radius)
  const response = await fetch(url)
  return response.json()
}

// Function to get place details
export async function getPlaceDetails(placeId: string) {
  const url = await getPlaceDetailsApiUrl(placeId)
  const response = await fetch(url)
  return response.json()
}

// Function to get place photo
export async function getPlacePhoto(photoReference: string, maxWidth = 400) {
  const url = await getPlacePhotoApiUrl(photoReference, maxWidth)
  const response = await fetch(url)
  return response.blob()
}
