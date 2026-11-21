import Batch from '../models/Batch.js'

// Super Admin sees everything; everyone else is scoped to the batches they teach.
export function isSuperAdmin(user) {
  return user?.role?.name === 'Super Admin'
}

// Returns null when the user may see ALL batches (Super Admin),
// otherwise an array of batch _ids where this user is the assigned teacher.
export async function scopedBatchIds(user) {
  if (isSuperAdmin(user)) return null
  const batches = await Batch.find({ teacher: user._id }).select('_id').lean()
  return batches.map((b) => b._id)
}

// True when the user is allowed to act on the given batch.
export async function canAccessBatch(user, batchId) {
  if (!batchId) return false
  if (isSuperAdmin(user)) return true
  return Boolean(await Batch.exists({ _id: batchId, teacher: user._id }))
}

// Helper: is `batchId` within a scope array returned by scopedBatchIds()?
export function inScope(scope, batchId) {
  if (scope === null) return true // unrestricted
  if (!batchId) return false
  return scope.some((id) => String(id) === String(batchId))
}
