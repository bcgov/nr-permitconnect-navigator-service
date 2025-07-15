import { Prisma } from '@prisma/client';

const accessRequestBase = Prisma.validator<Prisma.access_requestDefaultArgs>()({});
export type AccessRequestBase = Prisma.access_requestGetPayload<typeof accessRequestBase>;
export type AccessRequest = AccessRequestBase;

const activityBase = Prisma.validator<Prisma.activityDefaultArgs>()({});
export type ActivityBase = Prisma.activityGetPayload<typeof activityBase>;
export type Activity = ActivityBase & { activityContact?: ActivityContact[] };

const activityContactBase = Prisma.validator<Prisma.activity_contactDefaultArgs>()({});
export type ActivityContactBase = Prisma.activity_contactGetPayload<typeof activityContactBase>;
export type ActivityContact = ActivityContactBase & { contact?: Contact };

const contactBase = Prisma.validator<Prisma.contactDefaultArgs>()({});
export type ContactBase = Prisma.contactGetPayload<typeof contactBase>;
export type Contact = ContactBase;

const draftBase = Prisma.validator<Prisma.draftDefaultArgs>()({});
export type DraftBase = Prisma.draftGetPayload<typeof draftBase>;
export type Draft = DraftBase;

const documentBase = Prisma.validator<Prisma.documentDefaultArgs>()({});
export type DocumentBase = Prisma.documentGetPayload<typeof documentBase>;
export type Document = DocumentBase;

const electrificationProjectBase = Prisma.validator<Prisma.electrification_projectDefaultArgs>()({});
export type ElectrificationProjectBase = Prisma.electrification_projectGetPayload<typeof electrificationProjectBase>;
export type ElectrificationProject = ElectrificationProjectBase & { activity?: Activity; user?: User | null };

const emailLogBase = Prisma.validator<Prisma.email_logDefaultArgs>()({});
export type EmailLogBase = Prisma.email_logGetPayload<typeof emailLogBase>;
export type EmailLog = EmailLogBase;

const enquiryBase = Prisma.validator<Prisma.enquiryDefaultArgs>()({});
export type EnquiryBase = Prisma.enquiryGetPayload<typeof enquiryBase>;
export type Enquiry = EnquiryBase & { activity?: Activity; user?: User | null };

const housingProjectBase = Prisma.validator<Prisma.housing_projectDefaultArgs>()({});
export type HousingProjectBase = Prisma.housing_projectGetPayload<typeof housingProjectBase>;
export type HousingProject = HousingProjectBase & { activity?: Activity; user?: User | null };

const identityProviderBase = Prisma.validator<Prisma.identity_providerDefaultArgs>()({});
export type IdentityProviderBase = Prisma.identity_providerGetPayload<typeof identityProviderBase>;
export type IdentityProvider = IdentityProviderBase;

const initiativeBase = Prisma.validator<Prisma.initiativeDefaultArgs>()({});
export type InitiativeBase = Prisma.initiativeGetPayload<typeof initiativeBase>;
export type Initiative = InitiativeBase;

const noteBase = Prisma.validator<Prisma.noteDefaultArgs>()({});
export type NoteBase = Prisma.noteGetPayload<typeof noteBase>;
export type Note = NoteBase;

const noteHistoryBase = Prisma.validator<Prisma.note_historyDefaultArgs>()({});
export type NoteHistoryBase = Prisma.note_historyGetPayload<typeof noteHistoryBase>;
export type NoteHistory = NoteHistoryBase & { note?: Note[] };

const permitBase = Prisma.validator<Prisma.permitDefaultArgs>()({});
export type PermitBase = Prisma.permitGetPayload<typeof permitBase>;
export type Permit = PermitBase & { permitNote?: PermitNote[]; permitType?: PermitType };

const permitNoteBase = Prisma.validator<Prisma.permit_noteDefaultArgs>()({});
export type PermitNoteBase = Prisma.permit_noteGetPayload<typeof permitNoteBase>;
export type PermitNote = PermitNoteBase;

const permitTypeBase = Prisma.validator<Prisma.permit_typeDefaultArgs>()({});
export type PermitTypeBase = Prisma.permit_typeGetPayload<typeof permitTypeBase>;
export type PermitType = PermitTypeBase;

const user = Prisma.validator<Prisma.userDefaultArgs>()({});
export type UserBase = Prisma.userGetPayload<typeof user>;
export type User = UserBase & { identityProvider?: IdentityProvider };
