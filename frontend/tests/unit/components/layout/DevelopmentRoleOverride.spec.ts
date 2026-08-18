import { Button } from '@/lib/primevue';
import DevelopmentRoleOverride from '@/components/layout/DevelopmentRoleOverride.vue';
import { useAuthZStore } from '@/store';
import { GroupName, Initiative } from '@/utils/enums/application';

import { mountComponent } from '../../../mountComponent';

// Mount

function mountDevelopmentRoleOverride(options: { groupOverride?: GroupName; initiativeOverride?: Initiative } = {}) {
  const { groupOverride, initiativeOverride } = options;

  const { wrapper, pinia } = mountComponent(DevelopmentRoleOverride, {
    piniaState: { authz: { groupOverride, initiativeOverride } }
  });

  const authzStore = useAuthZStore(pinia!);

  // Both dropdowns render as real PrimeVue Select components -- there are
  // exactly two, initiative first then group, matching template order.
  const selects = wrapper.findAllComponents({ name: 'Select' });

  return { wrapper, authzStore, initiativeSelect: selects[0]!, groupSelect: selects[1]! };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// Tests

describe('DevelopmentRoleOverride', () => {
  describe('rendering', () => {
    it('initializes the initiative select from the store override', () => {
      const { initiativeSelect } = mountDevelopmentRoleOverride({ initiativeOverride: Initiative.HOUSING });

      expect(initiativeSelect.props('modelValue')).toBe(Initiative.HOUSING);
    });

    it('initializes the group select from the store override', () => {
      const { groupSelect } = mountDevelopmentRoleOverride({ groupOverride: GroupName.NAVIGATOR });

      expect(groupSelect.props('modelValue')).toBe(GroupName.NAVIGATOR);
    });
  });

  describe('user interaction', () => {
    it('sets the initiative override in the store when the initiative select changes', async () => {
      const { authzStore, initiativeSelect } = mountDevelopmentRoleOverride();

      await initiativeSelect.vm.$emit('change', { value: Initiative.ELECTRIFICATION });

      expect(authzStore.setInitiativeOverride).toHaveBeenCalledWith(Initiative.ELECTRIFICATION);
    });

    it('sets the group override in the store when the group select changes', async () => {
      const { authzStore, groupSelect } = mountDevelopmentRoleOverride();

      await groupSelect.vm.$emit('change', { value: GroupName.ADMIN });

      expect(authzStore.setGroupOverride).toHaveBeenCalledWith(GroupName.ADMIN);
    });

    it('clears both overrides when the End button is clicked', async () => {
      const { wrapper, authzStore } = mountDevelopmentRoleOverride({
        groupOverride: GroupName.ADMIN,
        initiativeOverride: Initiative.HOUSING
      });

      await wrapper.findComponent(Button).trigger('click');

      expect(authzStore.setGroupOverride).toHaveBeenCalledWith(undefined);
      expect(authzStore.setInitiativeOverride).toHaveBeenCalledWith(undefined);
    });
  });
});
