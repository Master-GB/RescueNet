export function buildShelterQuery(q) {
  console.log('buildShelterQuery - input query:', q);
  const filter = {};

  // text search (Mongo text index)
  if (q.search) {
    filter.$text = { $search: q.search };
  }

  // status
  if (q.status) filter.status = q.status;

  // city / province
  if (q.city) filter["address.city"] = new RegExp(`^${escapeRegex(q.city)}$`, "i");
  if (q.province) filter["address.province"] = new RegExp(`^${escapeRegex(q.province)}$`, "i");

  // verified
  if (q.verified === "true") filter.verified = true;
  if (q.verified === "false") filter.verified = false;

  // disaster types (multi)
  if (q.disasterTypes) {
    const arr = q.disasterTypes.split(",").map((s) => s.trim()).filter(Boolean);
    if (arr.length) filter["supports.disasterTypes"] = { $in: arr };
  }

  // boolean supports flags
const supportsKeys = ["wheelchairAccess", "medical", "food","water", "power"];
for (const key of supportsKeys) {
  if (q[key] === "true") filter[`supports.${key}`] = true;
  if (q[key] === "false") filter[`supports.${key}`] = false;
}

// specialSupport flags
const specialKeys = ["petFriendly", "childFriendly", "elderlySupport", "disabilitySupport","pregnancySupport"];
for (const key of specialKeys) {
  if (q[key] === "true") filter[`specialSupport.${key}`] = true;
  if (q[key] === "false") filter[`specialSupport.${key}`] = false;
}

// createdBy filter
if (q.createdBy) filter.createdBy = q.createdBy;

  return filter;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
