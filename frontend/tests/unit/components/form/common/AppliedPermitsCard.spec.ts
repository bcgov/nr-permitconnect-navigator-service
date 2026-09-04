import { nextTick } from 'vue';

import AppliedPermitsCard from '@/components/form/common/AppliedPermitsCard.vue';
import { DatePicker, InputText, Select } from '@/components/form';
import { Initiative } from '@/utils/enums/application';
import { FormState, FormType } from '@/utils/enums/projectCommon';

import { mountWithFormContext } from '../../../../mountWithFormContext';

import type { PermitType } from '@/types';

// Fixtures

const testPermitType = {
  permitTypeId: 1,
  agency: 'Test agency',
  branch: 'Test branch',
  businessDomain: 'Water',
  division: 'Test division',
  name: 'Test Permit',
  sourceSystem: 'test',
  createdBy: 'test',
  createdAt: '2024-01-01T00:00:00.000Z',
  permitTypeInitiativeXref: [
    { permitTypeId: 1, initiativeId: 'initiative-1', initiative: { code: Initiative.HOUSING } as unknown as Initiative }
  ]
} as unknown as PermitType;

// Mount

function mountAppliedPermitsCard(
  options: {
    defaultRow?: { permitTypeId?: number; trackingId?: number; submittedDate?: Date };
    header?: string;
    formType?: FormType;
    formState?: FormState;
    initialAppliedPermits?: Record<string, unknown>[];
    permitTypes?: PermitType[];
  } = {}
) {
  const {
    defaultRow,
    header,
    formType = FormType.NEW,
    formState = FormState.UNLOCKED,
    initialAppliedPermits,
    permitTypes = [testPermitType]
  } = options;

  const { wrapper, form } = mountWithFormContext(AppliedPermitsCard, {
    componentProps: { defaultRow, header },
    formProps: initialAppliedPermits
      ? { initialValues: { permits: { appliedPermits: initialAppliedPermits } } }
      : undefined,
    piniaState: {
      app: { initiative: Initiative.HOUSING },
      form: { formType, formState },
      permit: { permitTypes }
    }
  });

  return { wrapper, form };
}

// Tests

describe('AppliedPermitsCard', () => {
  describe('rendering', () => {
    it('renders the provided header', () => {
      const { wrapper } = mountAppliedPermitsCard({ header: 'Authorization type and IDs' });

      expect(wrapper.find('h6').text()).toBe('Authorization type and IDs');
    });

    it('does not render a header when none is provided', () => {
      const { wrapper } = mountAppliedPermitsCard();

      expect(wrapper.find('h6').exists()).toBe(false);
    });

    it('pushes the default row on mount when no permits are already registered', async () => {
      const { wrapper } = mountAppliedPermitsCard({ defaultRow: { permitTypeId: undefined } });
      await nextTick();

      expect(wrapper.findAllComponents(Select)).toHaveLength(1);
    });

    it('does not push a row when no default row is provided and none are registered', () => {
      const { wrapper } = mountAppliedPermitsCard();

      expect(wrapper.findAllComponents(Select)).toHaveLength(0);
    });

    it('renders one row per already-registered permit', () => {
      const { wrapper } = mountAppliedPermitsCard({
        initialAppliedPermits: [{ permitTypeId: 1 }, { permitTypeId: 2 }]
      });

      expect(wrapper.findAllComponents(Select)).toHaveLength(2);
    });

    it('binds each row to its indexed field names', () => {
      const { wrapper } = mountAppliedPermitsCard({
        initialAppliedPermits: [{ permitTypeId: 1 }, { permitTypeId: 2 }]
      });

      expect(wrapper.findAllComponents(Select).map((c) => c.props('name'))).toEqual([
        'permits.appliedPermits[0].permitTypeId',
        'permits.appliedPermits[1].permitTypeId'
      ]);
      expect(wrapper.findAllComponents(InputText).map((c) => c.props('name'))).toEqual([
        'permits.appliedPermits[0].permitTracking[0].trackingId',
        'permits.appliedPermits[1].permitTracking[0].trackingId'
      ]);
      expect(wrapper.findAllComponents(DatePicker).map((c) => c.props('name'))).toEqual([
        'permits.appliedPermits[0].submittedDate',
        'permits.appliedPermits[1].submittedDate'
      ]);
    });

    it('passes the initiative-scoped permit types to the Select, labelled by business domain and name', () => {
      const { wrapper } = mountAppliedPermitsCard({ initialAppliedPermits: [{ permitTypeId: 1 }] });
      const select = wrapper.findComponent(Select);

      // `getInitiativePermitTypes` strips `permitTypeInitiativeXref` off each
      // entry after filtering by it, so the options passed to the Select
      // don't carry it.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { permitTypeInitiativeXref, ...expectedOption } = testPermitType;
      expect(select.props('options')).toEqual([expectedOption]);
      expect((select.props('optionLabel') as (p: PermitType) => string)(testPermitType)).toBe('Water: Test Permit');
    });

    it('marks the Select as loading while no permit types are available yet', () => {
      const { wrapper } = mountAppliedPermitsCard({ initialAppliedPermits: [{ permitTypeId: 1 }], permitTypes: [] });

      expect(wrapper.findComponent(Select).props('loading')).toBe(true);
    });

    describe('mandatory fields', () => {
      describe('permitTypeId', () => {
        it('displays asterisk', () => {
          const { wrapper } = mountAppliedPermitsCard({ initialAppliedPermits: [{ permitTypeId: 1 }] });

          const select = wrapper.findComponent(Select);

          expect(select.props('placeholder')).toContain('*');
        });
      });
    });
  });

  describe('editable state', () => {
    it('disables every field when the form is not editable', () => {
      const { wrapper } = mountAppliedPermitsCard({
        initialAppliedPermits: [{ permitTypeId: 1 }],
        formState: FormState.LOCKED
      });

      expect(wrapper.findComponent(Select).props('disabled')).toBe(true);
      expect(wrapper.findComponent(InputText).props('disabled')).toBe(true);
      expect(wrapper.findComponent(DatePicker).props('disabled')).toBe(true);
    });

    it('hides the add and delete buttons when the form is not editable', () => {
      const { wrapper } = mountAppliedPermitsCard({
        initialAppliedPermits: [{ permitTypeId: 1 }],
        formState: FormState.LOCKED
      });

      expect(wrapper.findAll('button')).toHaveLength(0);
    });
  });

  describe('user interaction', () => {
    it('adds a new row when "Add permit" is clicked', async () => {
      const { wrapper } = mountAppliedPermitsCard({ initialAppliedPermits: [{ permitTypeId: 1 }] });

      // The last button is "Add permit" -- every row before it has its own
      // delete button first.
      await wrapper.findAll('button').at(-1)!.trigger('click');

      expect(wrapper.findAllComponents(Select)).toHaveLength(2);
    });

    it('removes a row when its delete button is clicked', async () => {
      const { wrapper } = mountAppliedPermitsCard({
        initialAppliedPermits: [{ permitTypeId: 1 }, { permitTypeId: 2 }]
      });

      await wrapper.findAll('button')[0].trigger('click');

      expect(wrapper.findAllComponents(Select)).toHaveLength(1);
      expect(wrapper.findComponent(Select).props('name')).toBe('permits.appliedPermits[0].permitTypeId');
    });
  });
});
