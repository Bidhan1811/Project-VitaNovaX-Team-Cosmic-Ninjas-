const shares = new Map()

export function createShare({ id, ownerEmail, encryptedPayload, createdAt }) {
  shares.set(id, { id, ownerEmail, encryptedPayload, createdAt, approved: false })
  return shares.get(id)
}

export function getShare(id) {
  return shares.get(id)
}

export function updateShareApproval(id, approved = true) {
  const share = shares.get(id)
  if (share) share.approved = approved
  return share
}
