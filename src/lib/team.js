/* The people who can own a deal. Replace with your team API when you have one. */
export const OWNERS = [
  { id: "u-mostafa", name: "Mostafa Nour" },
  { id: "u-laila", name: "Laila Samir" },
  { id: "u-daniel", name: "Daniel Wright" },
  { id: "u-sara", name: "Sara Khaled" },
  { id: "u-omar", name: "Omar Fahmy" },
];

/* The owner for an id, or null when the deal is unassigned or the person no longer exists */
export const getOwner = (id) => OWNERS.find((o) => o.id === id) ?? null;