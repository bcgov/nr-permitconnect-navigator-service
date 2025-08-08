import prisma from '../db/dataConnection';

const service = {
  getElectrificationProjectPermitData: async () => {
    const result = await prisma.$queryRaw`
    select project_name,
      c.first_name,
      c.last_name,
      c.phone_number,
      c.email,
      c.contact_preference,
      c.contact_applicant_relationship,
      ep.activity_id,
      submission_type,
      intake_status,
      application_status,
      p.issued_permit_id,
      (select ptr.tracking_id where ptr.shown_to_proponent = true) as tracking_id,
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
       ssc.display as source_system_acronym
    from electrification_project as ep
    join activity as a on ep.activity_id = a.activity_id
    join activity_contact as ac on ep.activity_id = ac.activity_id
    join contact as c on ac.contact_id = c.contact_id
    left join permit as p on ep.activity_id = p.activity_id
    left join permit_type pt on p.permit_type_id = pt.permit_type_id
    join source_system_code ssc on pt.source_system = ssc.code
    left join permit_tracking ptr on p.permit_id = ptr.permit_id
    where a.is_deleted = false
    order by ep.activity_id asc`;

    return result;
  },

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
      submission_type,
      intake_status,
      application_status,
      p.issued_permit_id,
      (select ptr.tracking_id where ptr.shown_to_proponent = true) as tracking_id,
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
      ssc.display as source_system_acronym
    from housing_project as hp
    join activity as a on hp.activity_id = a.activity_id
    join activity_contact as ac on hp.activity_id = ac.activity_id
    join contact as c on ac.contact_id = c.contact_id
    left join permit as p on hp.activity_id = p.activity_id
    left join permit_type pt on p.permit_type_id = pt.permit_type_id
    join source_system_code ssc on pt.source_system = ssc.code
    left join permit_tracking ptr on p.permit_id = ptr.permit_id
    where a.is_deleted = false
    order by hp.activity_id asc`;

    return result;
  }
};

export default service;
