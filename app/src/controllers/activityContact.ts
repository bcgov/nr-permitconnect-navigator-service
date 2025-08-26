import { v4 as uuidv4 } from 'uuid';

import { transactionWrapper } from '../db/utils/transactionWrapper';
import { deleteUnmatchedActivityContacts, upsertActivityContacts } from '../services/activityContact';
import { insertContacts } from '../services/contact';
import { partition } from '../utils/utils';

import type { Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection';
import type { Contact } from '../types';

export const updateActivityContactController = async (
  req: Request<never, never, { activityId: string; contacts: Contact[] }>,
  res: Response
) => {
  // Predicate function to check if a contact has a contactId.
  // Used to partition contacts into existing (with contactId) and new (without contactId).
  const hasContactId = (x: Contact) => !!x.contactId;

  // Partition contacts into existing and new based on whether they have a contactId
  const [existingContacts, newContacts] = partition(req.body.contacts, hasContactId);

  // Assign a new contactId to each new contact
  newContacts.forEach((x) => {
    x.contactId = uuidv4();
  });

  // Combine existing contacts with new contacts
  const contacts = existingContacts.concat(newContacts);

  await transactionWrapper(async (tx: PrismaTransactionClient) => {
    // Insert new contacts into the contact table
    await insertContacts(tx, newContacts, req.currentContext);

    // Delete any activity_contact records that doesn't match the activity and contacts in the request
    await deleteUnmatchedActivityContacts(tx, req.body.activityId, contacts);

    // Create or update activity_contact with the data from the request
    await upsertActivityContacts(tx, req.body.activityId, contacts);
  });

  res.status(200).end();
};
