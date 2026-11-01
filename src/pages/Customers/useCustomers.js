
import { useCallback, useEffect, useReducer } from "react";
import { buildSeed, STATUSES } from "./customers.data";

const KEY = "customers:v1";

const isValidCustomer = (customer) => {
  if (!customer || typeof customer !== "object" || Array.isArray(customer)) {
    return false;
  }

  return (
    typeof customer.id === "string" &&
    typeof customer.name === "string" &&
    typeof customer.email === "string" &&
    typeof customer.country === "string" &&
    STATUSES.includes(customer.status) &&
    typeof customer.joined === "string" &&
    !Number.isNaN(Date.parse(customer.joined)) &&
    Number.isFinite(customer.orders) &&
    customer.orders >= 0 &&
    Number.isFinite(customer.spent) &&
    customer.spent >= 0
  );
};

const isValidCustomerList = (value) =>
  Array.isArray(value) && value.every(isValidCustomer);

const load = () => {
  try {
    const raw = localStorage.getItem(KEY);

    if (raw) {
      const parsed = JSON.parse(raw);

      if (isValidCustomerList(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Storage unavailable or invalid JSON.
  }

  return buildSeed();
};

function reducer(state, action) {
  switch (action.type) {
    case "add":
      return [action.customer, ...state];

    case "update":
      return state.map((customer) =>
        customer.id === action.customer.id
          ? action.customer
          : customer
      );

    case "remove":
      return state.filter((customer) => customer.id !== action.id);

    case "restore": {
      const next = [...state];
      const index = Math.max(0, Math.min(action.index, next.length));

      next.splice(index, 0, action.customer);
      return next;
    }

    case "replace":
      return action.customers;

    default:
      return state;
  }
}

const newId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `c-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export default function useCustomers() {
  const [customers, dispatch] = useReducer(reducer, null, load);

  // Persist changes to localStorage.
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(customers));
    } catch {
      // Storage full or unavailable.
    }
  }, [customers]);

  // Sync changes made in other browser tabs.
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== KEY && event.key !== null) return;

      // localStorage.clear() was called in another tab.
      if (event.newValue === null) {
        dispatch({ type: "replace", customers: buildSeed() });
        return;
      }

      try {
        const parsed = JSON.parse(event.newValue);

        if (isValidCustomerList(parsed)) {
          dispatch({ type: "replace", customers: parsed });
        }
      } catch {
        // Ignore invalid external storage updates.
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const add = useCallback((data) => {
    const customer = {
      ...data,
      id: newId(),
      joined: new Date().toISOString(),
    };

    dispatch({ type: "add", customer });

    return customer;
  }, []);

  const update = useCallback((customer) => {
    dispatch({ type: "update", customer });
  }, []);

  const remove = useCallback(
    (id) => {
      const index = customers.findIndex((customer) => customer.id === id);
      const customer = customers[index];

      dispatch({ type: "remove", id });

      return { customer, index };
    },
    [customers]
  );

  const restore = useCallback(({ customer, index }) => {
    dispatch({ type: "restore", customer, index });
  }, []);

  return { customers, add, update, remove, restore };
}










// import { useCallback, useEffect, useReducer } from "react";
// import { buildSeed } from "./customers.data";

// /*
//   Customer store: a reducer persisted to localStorage.
//   To use a real API, keep this hook's return shape and replace the dispatch calls with fetches.
// */
// const KEY = "customers:v1";

// const load = () => {
//   try {
//     const raw = localStorage.getItem(KEY);
//     if (raw) return JSON.parse(raw);
//   } catch { /* ignore corrupt or unavailable storage */ }
//   return buildSeed();
// };

// function reducer(state, action) {
//   switch (action.type) {
//     case "add": return [action.customer, ...state];
//     case "update": return state.map((c) => (c.id === action.customer.id ? action.customer : c));
//     case "remove": return state.filter((c) => c.id !== action.id);
//     case "restore": { const next = [...state]; next.splice(action.index, 0, action.customer); return next; }
//     default: return state;
//   }
// }

// const newId = () => globalThis.crypto?.randomUUID?.() ?? `c-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

// export default function useCustomers() {
//   const [customers, dispatch] = useReducer(reducer, null, load);

//   useEffect(() => {
//     try { localStorage.setItem(KEY, JSON.stringify(customers)); } catch { /* storage full or blocked */ }
//   }, [customers]);

//   const add = useCallback((data) => {
//     const customer = { ...data, id: newId(), joined: new Date().toISOString() };
//     dispatch({ type: "add", customer });
//     return customer;
//   }, []);

//   const update = useCallback((customer) => dispatch({ type: "update", customer }), []);

//   const remove = useCallback((id) => {
//     const index = customers.findIndex((c) => c.id === id);
//     const customer = customers[index];
//     dispatch({ type: "remove", id });
//     return { customer, index };
//   }, [customers]);

//   const restore = useCallback(({ customer, index }) => dispatch({ type: "restore", customer, index }), []);

//   return { customers, add, update, remove, restore };
// }
