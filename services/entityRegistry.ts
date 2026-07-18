import type { ArchitectureEntity, DetectedArchitecture } from "@/services/architectureAnalyzer";

export interface EntityRegistryEntry extends ArchitectureEntity {
  prismaModelName: string;
  prismaClientAccessor: string;
  apiRouteName: string;
  uiResourceName: string;
}

const toPascalCase = (value: string): string => {
  const sanitized = value
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim();

  if (!sanitized) {
    return "Entity";
  }

  return sanitized
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
};

const toCamelCase = (value: string): string => {
  const pascal = toPascalCase(value);
  if (!pascal) {
    return "entity";
  }

  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
};

const toUiResourceName = (value: string): string => {
  return toPascalCase(value);
};

export function buildEntityRegistry(architecture: DetectedArchitecture | null | undefined): EntityRegistryEntry[] {
  if (!architecture?.entities?.length) {
    return [];
  }

  return architecture.entities.map((entity) => {
    const prismaModelName = entity.prismaModelName?.trim() || toPascalCase(entity.singular || entity.name || "Entity");
    const prismaClientAccessor = entity.prismaClientAccessor?.trim() || toCamelCase(prismaModelName);
    const apiRouteName = entity.apiRouteName?.trim() || entity.slug?.trim() || toCamelCase(entity.name ?? prismaModelName);
    const uiResourceName = entity.uiResourceName?.trim() || toUiResourceName(entity.singular || entity.name || prismaModelName);

    return {
      ...entity,
      prismaModelName,
      prismaClientAccessor,
      apiRouteName,
      uiResourceName,
    };
  });
}
