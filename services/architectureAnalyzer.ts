export interface ArchitectureEntity {
  name: string;
  singular: string;
  slug: string;
  prismaModelName?: string;
  prismaClientAccessor?: string;
  apiRouteName?: string;
  uiResourceName?: string;
}

export interface DetectedArchitecture {
  domain: string;
  entities: ArchitectureEntity[];
  relationships: string[];
  crudModules: string[];
}

const profiles: Array<{ domain: string; terms: string[]; entities: string[]; relationships: string[] }> = [
  { domain: "Gym management", terms: ["gym", "fitness", "membership", "trainer"], entities: ["Members", "Trainers", "Membership Plans", "Attendance", "Payments"], relationships: ["Members can be assigned to trainers and membership plans.", "Attendance and payments belong to members."] },
  { domain: "Library management", terms: ["library", "book", "borrow", "catalog"], entities: ["Books", "Members", "Borrow Records", "Returns"], relationships: ["Borrow records connect books and members.", "Returns complete borrow records."] },
  { domain: "Hospital management", terms: ["hospital", "patient", "doctor", "appointment", "clinic"], entities: ["Patients", "Doctors", "Appointments"], relationships: ["Appointments connect patients and doctors."] },
  { domain: "Inventory management", terms: ["inventory", "product", "supplier", "stock", "warehouse"], entities: ["Products", "Suppliers", "Orders", "Stock"], relationships: ["Products are supplied by suppliers and tracked in stock.", "Orders contain products."] },
  { domain: "Restaurant management", terms: ["restaurant", "menu", "table", "order", "dining"], entities: ["Menu Items", "Tables", "Orders"], relationships: ["Orders are placed at tables and contain menu items."] },
];

const entity = (name: string): ArchitectureEntity => {
  const singular = name.replace(/ies$/i, "y").replace(/s$/i, "");
  return { name, singular, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") };
};

export function analyzeArchitecture(prompt: string): DetectedArchitecture {
  const normalized = prompt.toLowerCase();
  const profile = profiles.find((candidate) => candidate.terms.some((term) => normalized.includes(term)));
  if (profile) return { domain: profile.domain, entities: profile.entities.map(entity), relationships: profile.relationships, crudModules: profile.entities.map((name) => `${name} CRUD`) };
  const title = prompt.match(/build (?:a |an )?([^,.]+)/i)?.[1]?.trim() || "Business";
  const entities = ["Records", "Users", "Transactions"].map(entity);
  return { domain: `${title} management`, entities, relationships: ["Transactions are associated with users and records."], crudModules: entities.map((item) => `${item.name} CRUD`) };
}

export const architectureAnalyzer = { analyze: analyzeArchitecture };
