import { DeleteRequestDTO, GetRequestDTO, ListRequestDTO, ResourceSchemaConfig, UpsertRequestDTO } from './dto';
import { Permit, PermitBase } from './models';

/**
 * Permit
 */

interface PermitSchema extends ResourceSchemaConfig<PermitBase> {
  ids: 'permitId';
  immutable: 'permitId';
  serverGenerated: 'permitId';
  query: {
    activityId: string;
    dateRange: [Date, Date];
    includeNotes: boolean;
    permitTypeId: number;
    searchTag: string;
    sourceSystemKindId: number;
  };
}
export type DeletePermitRequest = DeleteRequestDTO<Permit, PermitSchema>;
export type GetPermitRequest = GetRequestDTO<Permit, PermitSchema>;
export type ListPermitsRequest = ListRequestDTO<Permit, PermitSchema>;
export type UpsertPermitRequest = UpsertRequestDTO<PermitBase, PermitSchema>;
