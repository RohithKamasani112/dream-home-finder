// Local JSON-as-DB store. Seeded from bundled JSON files and persisted
// to localStorage so demo CRUD (admin posting, signups, favorites) survives
// reloads. Swap this layer for S3 GET/PUT later — the API surface stays.

import seedProperties from "@/data/properties.json";
import seedUsers from "@/data/users.json";

export type Listing = "sell" | "rent";
export type PropertyType = "apartment" | "villa" | "plot" | "commercial";

export interface Property {
  id: number;
  type: PropertyType;
  listing: Listing;
  title: string;
  price?: number;
  rent?: number;
  deposit?: number;
  leaseMonths?: number;
  currency: string;
  address: string;
  beds: number;
  baths: number;
  area: number; // sqft
  verified?: boolean;
  luxury?: boolean;
  furnished?: boolean;
  readyToMove?: boolean;
  newlyAdded?: boolean;
  petFriendly?: boolean;
  facing?: string;
  age?: number;
  parking?: number;
  description: string;
  amenities: string[];
  youtubeId?: string;
  images: string[];
}

export interface PropertiesFile {
  lastId: number;
  items: Property[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "admin" | "customer";
}

const PROP_KEY = "estate.properties.v1";
const USERS_KEY = "estate.users.v1";
const FAVS_KEY = "estate.favorites.v1";
const SESSION_KEY = "estate.session.v1";
const LEADS_KEY = "estate.leads.v1";

function isBrowser() {
  return typeof window !== "undefined";
}

function readJSON<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON<T>(key: string, value: T) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* noop */
  }
}

/* ------------------------- Properties ------------------------- */

export function loadProperties(): PropertiesFile {
  const stored = readJSON<PropertiesFile | null>(PROP_KEY, null);
  if (stored && stored.items && stored.items.length) return stored;
  const seed = seedProperties as PropertiesFile;
  writeJSON(PROP_KEY, seed);
  return seed;
}

export function saveProperties(file: PropertiesFile) {
  writeJSON(PROP_KEY, file);
}

export function listProperties(): Property[] {
  return loadProperties().items;
}

export function getProperty(id: number): Property | undefined {
  return loadProperties().items.find((p) => p.id === id);
}

export function addProperty(input: Omit<Property, "id">): Property {
  const file = loadProperties();
  const nextId = file.lastId + 1;
  const created: Property = { ...input, id: nextId };
  file.items = [created, ...file.items];
  file.lastId = nextId;
  saveProperties(file);
  return created;
}

export function updateProperty(id: number, patch: Partial<Property>) {
  const file = loadProperties();
  file.items = file.items.map((p) => (p.id === id ? { ...p, ...patch, id } : p));
  saveProperties(file);
}

export function deleteProperty(id: number) {
  const file = loadProperties();
  file.items = file.items.filter((p) => p.id !== id);
  saveProperties(file);
}

/* --------------------------- Users ---------------------------- */

interface UsersFile {
  users: User[];
}

export function loadUsers(): UsersFile {
  const stored = readJSON<UsersFile | null>(USERS_KEY, null);
  if (stored && stored.users && stored.users.length) return stored;
  const seed = seedUsers as UsersFile;
  writeJSON(USERS_KEY, seed);
  return seed;
}
export function saveUsers(file: UsersFile) {
  writeJSON(USERS_KEY, file);
}
export function signupUser(input: Omit<User, "id" | "role"> & { role?: User["role"] }): User {
  const file = loadUsers();
  if (file.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error("An account with this email already exists.");
  }
  const nextId = Math.max(0, ...file.users.map((u) => u.id)) + 1;
  const user: User = { ...input, id: nextId, role: input.role ?? "customer" };
  file.users.push(user);
  saveUsers(file);
  return user;
}
export function loginUser(emailOrPhone: string, password: string): User {
  const file = loadUsers();
  const u = file.users.find(
    (x) =>
      (x.email.toLowerCase() === emailOrPhone.toLowerCase() || x.phone === emailOrPhone) &&
      x.password === password,
  );
  if (!u) throw new Error("Invalid credentials. Try admin@estate.app / admin123");
  return u;
}

/* -------------------------- Session --------------------------- */

export interface Session {
  userId: number;
  role: User["role"];
  name: string;
}

export function getSession(): Session | null {
  return readJSON<Session | null>(SESSION_KEY, null);
}
export function setSession(s: Session | null) {
  if (!isBrowser()) return;
  if (s) window.localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  else window.localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event("estate:session"));
}

/* ------------------------- Favorites -------------------------- */

export function getFavorites(): number[] {
  return readJSON<number[]>(FAVS_KEY, []);
}
export function toggleFavorite(id: number): number[] {
  const cur = new Set(getFavorites());
  if (cur.has(id)) cur.delete(id);
  else cur.add(id);
  const next = [...cur];
  writeJSON(FAVS_KEY, next);
  if (isBrowser()) window.dispatchEvent(new Event("estate:favorites"));
  return next;
}

/* ---------------------------- Leads --------------------------- */

export interface Lead {
  id: number;
  propertyId: number;
  name: string;
  email: string;
  phone: string;
  intent: "brochure" | "info" | "visit" | "contact";
  createdAt: string;
}
export function addLead(input: Omit<Lead, "id" | "createdAt">): Lead {
  const list = readJSON<Lead[]>(LEADS_KEY, []);
  const next: Lead = {
    ...input,
    id: list.length ? Math.max(...list.map((l) => l.id)) + 1 : 1,
    createdAt: new Date().toISOString(),
  };
  list.unshift(next);
  writeJSON(LEADS_KEY, list);
  return next;
}
export function listLeads(): Lead[] {
  return readJSON<Lead[]>(LEADS_KEY, []);
}

/* --------------------------- Format --------------------------- */

export function money(n?: number, currency = "USD") {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${currency === "USD" ? "$" : ""}${(n / 1_000_000).toFixed(n % 1_000_000 ? 2 : 1)}M`;
  if (n >= 1000) return `${currency === "USD" ? "$" : ""}${(n / 1000).toFixed(n % 1000 ? 1 : 0)}K`;
  return `${currency === "USD" ? "$" : ""}${n.toLocaleString()}`;
}
export function fullMoney(n?: number, currency = "USD") {
  if (n == null) return "—";
  return `${currency === "USD" ? "$" : ""}${n.toLocaleString()}`;
}
