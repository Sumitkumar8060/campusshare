// These values must mirror the enums defined in the backend models exactly
// (models/Item.js and models/Request.js). Do not add values the backend
// doesn't accept — createItem/updateItem will store whatever is sent, but
// only these are validated as intentional enum values in the schema.

export const LISTING_TYPES = [
  { value: "Sell", label: "Sell" },
  { value: "Rent", label: "Rent" },
  { value: "GiveAway", label: "Give Away" },
];

export const CONDITIONS = [
  { value: "New", label: "New" },
  { value: "Good", label: "Good" },
  { value: "Fair", label: "Fair" },
  { value: "Poor", label: "Poor" },
];

export const REQUEST_STATUSES = ["PENDING", "ACCEPTED", "REJECTED", "CANCELLED", "COMPLETED"];

// The Item model does NOT define a category enum — `category` is a free-text
// required string. We offer common suggestions in the create form's datalist
// but do not restrict input to this list, and we derive real filter options
// from whatever categories already exist in fetched listings.
export const SUGGESTED_CATEGORIES = [
  "Books & Study Material",
  "Electronics",
  "Furniture",
  "Cycles",
  "Appliances",
  "Sports Equipment",
  "Musical Instruments",
  "Clothing",
  "Stationery",
  "Lab Equipment",
  "Kitchen & Utensils",
  "Other",
];
