"use server"

import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"
import { logAdminAction } from "./audit-log-actions"

// Feature management
export async function createFeature({
  name,
  key,
  description,
  category,
  isActive = true,
}: {
  name: string
  key: string
  description?: string
  category?: string
  isActive?: boolean
}) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    const { data, error } = await supabase
      .from("features")
      .insert({
        name,
        key,
        description,
        category,
        is_active: isActive,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating feature:", error)
      return { success: false, error: error.message }
    }

    // Log the admin action
    await logAdminAction({
      actionType: "create",
      entityType: "feature",
      entityId: data.id,
      newState: data,
      details: { summary: `Created feature: ${name}` },
    })

    return { success: true, feature: data }
  } catch (error) {
    console.error("Error in createFeature:", error)
    return { success: false, error: String(error) }
  }
}

export async function updateFeature({
  id,
  name,
  key,
  description,
  category,
  isActive,
}: {
  id: string
  name?: string
  key?: string
  description?: string
  category?: string
  isActive?: boolean
}) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Get the current state for audit log
    const { data: previousState } = await supabase.from("features").select("*").eq("id", id).single()

    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (key !== undefined) updates.key = key
    if (description !== undefined) updates.description = description
    if (category !== undefined) updates.category = category
    if (isActive !== undefined) updates.is_active = isActive
    updates.updated_at = new Date().toISOString()

    const { data, error } = await supabase.from("features").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("Error updating feature:", error)
      return { success: false, error: error.message }
    }

    // Log the admin action
    await logAdminAction({
      actionType: "update",
      entityType: "feature",
      entityId: id,
      previousState,
      newState: data,
      details: { summary: `Updated feature: ${data.name}` },
    })

    return { success: true, feature: data }
  } catch (error) {
    console.error("Error in updateFeature:", error)
    return { success: false, error: String(error) }
  }
}

export async function deleteFeature(id: string) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Get the current state for audit log
    const { data: previousState } = await supabase.from("features").select("*").eq("id", id).single()

    const { error } = await supabase.from("features").delete().eq("id", id)

    if (error) {
      console.error("Error deleting feature:", error)
      return { success: false, error: error.message }
    }

    // Log the admin action
    await logAdminAction({
      actionType: "delete",
      entityType: "feature",
      entityId: id,
      previousState,
      details: { summary: `Deleted feature: ${previousState.name}` },
    })

    return { success: true }
  } catch (error) {
    console.error("Error in deleteFeature:", error)
    return { success: false, error: String(error) }
  }
}

export async function getFeatures() {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    const { data, error } = await supabase
      .from("features")
      .select("*")
      .order("category", { ascending: true })
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching features:", error)
      return { success: false, error: error.message }
    }

    return { success: true, features: data }
  } catch (error) {
    console.error("Error in getFeatures:", error)
    return { success: false, error: String(error) }
  }
}

// Subscription tier management
export async function getSubscriptionTiers() {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    const { data, error } = await supabase.from("subscription_tiers").select("*").order("price", { ascending: true })

    if (error) {
      console.error("Error fetching subscription tiers:", error)
      return { success: false, error: error.message }
    }

    return { success: true, tiers: data }
  } catch (error) {
    console.error("Error in getSubscriptionTiers:", error)
    return { success: false, error: String(error) }
  }
}

export async function getSubscriptionTierWithFeatures(tierId: string) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Get the subscription tier
    const { data: tier, error: tierError } = await supabase
      .from("subscription_tiers")
      .select("*")
      .eq("id", tierId)
      .single()

    if (tierError) {
      console.error("Error fetching subscription tier:", tierError)
      return { success: false, error: tierError.message }
    }

    // Get the features for this tier
    const { data: tierFeatures, error: featuresError } = await supabase
      .from("subscription_tier_features")
      .select(`
        feature_id,
        is_enabled,
        limit_id,
        features (
          id,
          name,
          key,
          description,
          category
        ),
        feature_limits (
          id,
          max_count
        )
      `)
      .eq("subscription_tier_id", tierId)

    if (featuresError) {
      console.error("Error fetching tier features:", featuresError)
      return { success: false, error: featuresError.message }
    }

    // Get all available features
    const { data: allFeatures, error: allFeaturesError } = await supabase
      .from("features")
      .select("*")
      .order("category", { ascending: true })
      .order("name", { ascending: true })

    if (allFeaturesError) {
      console.error("Error fetching all features:", allFeaturesError)
      return { success: false, error: allFeaturesError.message }
    }

    // Format the response
    const formattedFeatures = allFeatures.map((feature) => {
      const tierFeature = tierFeatures.find((tf) => tf.feature_id === feature.id)

      return {
        ...feature,
        isEnabled: tierFeature ? tierFeature.is_enabled : false,
        limit: tierFeature?.feature_limits?.max_count || null,
        limitId: tierFeature?.limit_id || null,
      }
    })

    return {
      success: true,
      tier,
      features: formattedFeatures,
    }
  } catch (error) {
    console.error("Error in getSubscriptionTierWithFeatures:", error)
    return { success: false, error: String(error) }
  }
}

export async function updateTierFeatures({
  tierId,
  features,
}: {
  tierId: string
  features: {
    featureId: string
    isEnabled: boolean
    limit?: number | null
  }[]
}) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Get the current state for audit log
    const { data: previousState } = await supabase
      .from("subscription_tier_features")
      .select(`
        feature_id,
        is_enabled,
        limit_id,
        features (name),
        feature_limits (max_count)
      `)
      .eq("subscription_tier_id", tierId)

    // Get the tier name for the audit log
    const { data: tier } = await supabase.from("subscription_tiers").select("name").eq("id", tierId).single()

    // Process each feature
    for (const feature of features) {
      // Check if this feature is already mapped to the tier
      const { data: existingMapping } = await supabase
        .from("subscription_tier_features")
        .select("*")
        .eq("subscription_tier_id", tierId)
        .eq("feature_id", feature.featureId)
        .maybeSingle()

      if (existingMapping) {
        // Update the existing mapping
        if (feature.limit !== undefined && feature.limit !== null) {
          // Update or create the feature limit
          if (existingMapping.limit_id) {
            // Update existing limit
            await supabase
              .from("feature_limits")
              .update({ max_count: feature.limit })
              .eq("id", existingMapping.limit_id)
          } else {
            // Create new limit
            const { data: newLimit } = await supabase
              .from("feature_limits")
              .insert({
                feature_id: feature.featureId,
                subscription_tier_id: tierId,
                max_count: feature.limit,
              })
              .select("id")
              .single()

            // Update the mapping with the new limit ID
            await supabase
              .from("subscription_tier_features")
              .update({ limit_id: newLimit.id, is_enabled: feature.isEnabled })
              .eq("subscription_tier_id", tierId)
              .eq("feature_id", feature.featureId)
          }
        } else {
          // Just update the enabled status
          await supabase
            .from("subscription_tier_features")
            .update({ is_enabled: feature.isEnabled })
            .eq("subscription_tier_id", tierId)
            .eq("feature_id", feature.featureId)
        }
      } else {
        // Create a new mapping
        if (feature.limit !== undefined && feature.limit !== null) {
          // Create a limit first
          const { data: newLimit } = await supabase
            .from("feature_limits")
            .insert({
              feature_id: feature.featureId,
              subscription_tier_id: tierId,
              max_count: feature.limit,
            })
            .select("id")
            .single()

          // Create the mapping with the limit
          await supabase.from("subscription_tier_features").insert({
            subscription_tier_id: tierId,
            feature_id: feature.featureId,
            is_enabled: feature.isEnabled,
            limit_id: newLimit.id,
          })
        } else {
          // Create the mapping without a limit
          await supabase.from("subscription_tier_features").insert({
            subscription_tier_id: tierId,
            feature_id: feature.featureId,
            is_enabled: feature.isEnabled,
          })
        }
      }
    }

    // Get the new state for audit log
    const { data: newState } = await supabase
      .from("subscription_tier_features")
      .select(`
        feature_id,
        is_enabled,
        limit_id,
        features (name),
        feature_limits (max_count)
      `)
      .eq("subscription_tier_id", tierId)

    // Log the admin action
    await logAdminAction({
      actionType: "update",
      entityType: "subscription",
      entityId: tierId,
      previousState,
      newState,
      details: {
        summary: `Updated features for subscription tier: ${tier?.name}`,
        featureCount: features.length,
        enabledFeatures: features.filter((f) => f.isEnabled).length,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Error in updateTierFeatures:", error)
    return { success: false, error: String(error) }
  }
}
