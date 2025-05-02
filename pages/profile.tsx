"use client"

import type React from "react"

import { useEffect, useContext, useState } from "react"
import { useRouter } from "next/router"
import { AuthContext } from "./_app"
import { createPagesClient } from "../lib/auth/pages-auth"

export default function Profile() {
  const { session, loading } = useContext(AuthContext)
  const router = useRouter()
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!loading && !session) {
      router.push("/login")
    }

    if (session) {
      // Load profile data
      const loadProfile = async () => {
        try {
          const supabase = createPagesClient()
          const { data, error } = await supabase.from("profiles").select("name, bio").eq("id", session.user.id).single()

          if (error) throw error

          if (data) {
            setName(data.name || "")
            setBio(data.bio || "")
          }
        } catch (error: any) {
          console.error("Error loading profile:", error.message)
        }
      }

      loadProfile()
    }
  }, [session, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createPagesClient()
      const { error } = await supabase.from("profiles").upsert({
        id: session?.user.id,
        name,
        bio,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      setSuccess(true)
    } catch (error: any) {
      setError(error.message || "An error occurred while saving profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              {error && <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">{error}</div>}

              {success && (
                <div className="mb-4 p-4 text-green-700 bg-green-100 rounded-md">Profile updated successfully!</div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <div className="mt-1">
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                      Bio
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
