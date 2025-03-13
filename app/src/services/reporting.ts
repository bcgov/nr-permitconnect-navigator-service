import prisma from '../db/dataConnection';

const service = {
  getHousingProjectPermitData: async () => {
    const result = await prisma.$queryRaw`
    select project_name,
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
      street_address,
      locality,
      latitude,
      longitude,
      location_pids,
      housing_project_type,
      intake_status,
      application_status,
      p.issued_permit_id,
      p.tracking_id,
      p.auth_status,
      p.needed,
      p.status,
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
      pt.source_system_acronym
    from housing_project as hp
    join activity as a on hp.activity_id = a.activity_id
    join activity_contact as ac on hp.activity_id = ac.activity_id
    join contact as c on ac.contact_id = c.contact_id
    join permit as p on hp.activity_id = p.activity_id
    join permit_type pt on p.permit_type_id = pt.permit_type_id
    where a.is_deleted = false`;

    return result;
  }
};

export default service;
