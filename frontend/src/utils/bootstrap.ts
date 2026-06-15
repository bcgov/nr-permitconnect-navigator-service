import { storeToRefs } from 'pinia';

import { contactService, permitTypeService, yarsService } from '@/services';
import { useAuthNStore, useAuthZStore, useContactStore, usePermitStore } from '@/store';

/**
 * Initializes the authenticated application context.
 *
 * This includes loading authenticated user data and application reference
 * data that should be available for the duration of the session.
 *
 * Called by both the bootstrapper and OIDC callback flow after
 * authentication has been established.
 */
export async function loadAuthenticatedContext() {
  const authnStore = useAuthNStore();

  const { getIsAuthenticated } = storeToRefs(authnStore);

  if (getIsAuthenticated.value) {
    const authzStore = useAuthZStore();
    const contactStore = useContactStore();
    const permitStore = usePermitStore();

    const authorizationContext = await yarsService.getAuthorizationContext();
    authzStore.setAuthorizationContext(authorizationContext);
    const contact = await contactService.getCurrentUserContact();
    contactStore.setContact(contact);

    const permitTypes = await permitTypeService.listPermitTypes({});
    permitStore.setPermitTypes(permitTypes);
  }
}
