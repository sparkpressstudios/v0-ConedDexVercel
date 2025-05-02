/**
 * API Client utility for making fetch requests with error handling and cancellation
 */

type RequestOptions = RequestInit & {
  timeout?: number
}

type ApiResponse<T> = {
  data: T | null
  error: Error | null
  status: number
}

/**
 * Make an API request with error handling and timeout
 */
export async function apiRequest<T>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { timeout = 10000, ...fetchOptions } = options

  // Create an AbortController for timeout and cancellation
  const controller = new AbortController()
  const { signal } = controller

  // Set up timeout
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal,
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
    })

    // Clear timeout since request completed
    clearTimeout(timeoutId)

    // Handle HTTP errors
    if (!response.ok) {
      let errorMessage = `API Error: ${response.status} ${response.statusText}`

      // Try to get more detailed error message from response
      try {
        const errorData = await response.json()
        if (errorData.message || errorData.error) {
          errorMessage = errorData.message || errorData.error
        }
      } catch (e) {
        // If we can't parse the error as JSON, just use the default error message
      }

      throw new Error(errorMessage)
    }

    // Parse JSON response
    let data: T | null = null

    if (response.headers.get("Content-Type")?.includes("application/json")) {
      data = await response.json()
    }

    return {
      data,
      error: null,
      status: response.status,
    }
  } catch (error: any) {
    // Clear timeout if there was an error
    clearTimeout(timeoutId)

    // Handle aborted requests
    if (error.name === "AbortError") {
      return {
        data: null,
        error: new Error("Request timed out"),
        status: 0,
      }
    }

    return {
      data: null,
      error,
      status: 0,
    }
  }
}

/**
 * Make a GET request
 */
export function get<T>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: "GET",
    ...options,
  })
}

/**
 * Make a POST request
 */
export function post<T>(url: string, data: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: "POST",
    body: JSON.stringify(data),
    ...options,
  })
}

/**
 * Make a PUT request
 */
export function put<T>(url: string, data: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: "PUT",
    body: JSON.stringify(data),
    ...options,
  })
}

/**
 * Make a DELETE request
 */
export function del<T>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    method: "DELETE",
    ...options,
  })
}
