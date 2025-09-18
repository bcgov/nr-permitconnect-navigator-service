import type { PrismaTransactionClient } from '../db/dataConnection';

/**
 * Execute a raw query to get electrification permit reporting data
 * @param tx Prisma transaction client
 * @returns A Promise that resolve to the result of the raw query
 */
export const getElectrificationProjectPermitData = async (tx: PrismaTransactionClient) => {
  const result = await tx.$queryRaw`
    select ep.project_name,
      c.first_name,
      c.last_name,
      c.phone_number,
      c.email,
      c.contact_preference,
      c.contact_applicant_relationship,
      ep.activity_id,
      ep.submission_type,
      ep.intake_status,
      ep.application_status,
      p.issued_permit_id,
      ptr.tracking_id,
      p.state,
      p.needed,
      p.stage,
      p.submitted_date,
      p.adjudication_date,
      p.status_last_verified,
      pt.agency,
      pt.division,
      pt.branch,
      pt."type" as permit_type,
      pt.family,
      pt.name,
      pt.acronym,
      pt.tracked_in_ats,
      pt.source_system,
       ssc.display as source_system_acronym
    from electrification_project as ep
    join activity as a on ep.activity_id = a.activity_id and a.deleted_at is null
    join activity_contact as ac on ep.activity_id = ac.activity_id
    join contact as c on ac.contact_id = c.contact_id
    left join permit as p on ep.activity_id = p.activity_id
    left join permit_type pt on p.permit_type_id = pt.permit_type_id
    left join source_system_code ssc on pt.source_system = ssc.code
    left join permit_tracking ptr on p.permit_id = ptr.permit_id and ptr.shown_to_proponent = true
    order by ep.activity_id asc`;

  return result;
};

/**
 * Execute a raw query to get housing permit reporting data
 * @param tx Prisma transaction client
 * @returns A Promise that resolve to the result of the raw query
 */
export const getHousingProjectPermitData = async (tx: PrismaTransactionClient) => {
  const result = await tx.$queryRaw`
    select hp.project_name,
      case
        when hp.consent_to_feedback then 'Yes'
        else 'No'
      end as consent_to_feedback,
      c.first_name,
      c.last_name,
      c.phone_number,
      c.email,
      c.contact_preference,
      c.contact_applicant_relationship,
      hp.activity_id,
      hp.street_address,
      hp.locality,
      hp.latitude,
      hp.longitude,
      hp.location_pids,
      hp.submission_type,
      hp.intake_status,
      hp.application_status,
      p.issued_permit_id,
      ptr.tracking_id,
      p.state,
      p.needed,
      p.stage,
      p.submitted_date,
      p.adjudication_date,
      p.status_last_verified,
      pt.agency,
      pt.division,
      pt.branch,
      pt."type" as permit_type,
      pt.family,
      pt.name,
      pt.acronym,
      pt.tracked_in_ats,
      pt.source_system,
      ssc.display as source_system_acronym
    from housing_project as hp
    join activity as a on hp.activity_id = a.activity_id and a.deleted_at is null
    join activity_contact as ac on hp.activity_id = ac.activity_id
    join contact as c on ac.contact_id = c.contact_id
    left join permit as p on hp.activity_id = p.activity_id
    left join permit_type pt on p.permit_type_id = pt.permit_type_id
    left join source_system_code ssc on pt.source_system = ssc.code
    left join permit_tracking ptr on p.permit_id = ptr.permit_id and ptr.shown_to_proponent = true
    order by hp.activity_id asc`;

  return result;
};
