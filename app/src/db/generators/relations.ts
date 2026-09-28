export interface RelationInfo {
  targetModel: string;
  isList: boolean;
}

interface DmmfField {
  name: string;
  kind: string;
  type: string;
  isList: boolean;
  relationName?: string;
}

interface DmmfModel {
  name: string;
  fields: readonly DmmfField[];
}

/**
 * Builds a map of model name -> relation field name -> relation target info,
 * from a Prisma DMMF model list. Models with no relation fields are omitted entirely.
 * @param models Prisma DMMF models to inspect for relation fields.
 * @returns Map of model name to its relation fields' target model and cardinality.
 */
export function buildRelationsMap(models: readonly DmmfModel[]): Record<string, Record<string, RelationInfo>> {
  const relations: Record<string, Record<string, RelationInfo>> = {};

  for (const model of models) {
    const modelRelations: Record<string, RelationInfo> = {};
    for (const field of model.fields) {
      if (field.kind === 'object' && field.relationName) {
        modelRelations[field.name] = { targetModel: field.type, isList: field.isList };
      }
    }
    if (Object.keys(modelRelations).length > 0) {
      relations[model.name] = modelRelations;
    }
  }

  return relations;
}
