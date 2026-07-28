import { DOMWrapper } from '@vue/test-utils';

import ProjectIntakeAssistance from '@/components/general/project/ProjectIntakeAssistance.vue';
import { IntakeFormCategory } from '@/utils/enums/projectCommon';
import { ContactPreference, ProjectRelationship } from '@/utils/enums/projectCommon';

import { mountComponent } from '../../../../mountComponent';

// Mocks

const mockRequire = vi.fn();

vi.mock('@/lib/primevue', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useConfirm: () => ({ require: mockRequire })
  };
});

// Fixtures

const validContact = {
  contactId: '82fba7a8-9cb6-47c4-95b0-81c165e5a317',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phoneNumber: '123-456-7890',
  contactApplicantRelationship: ProjectRelationship.CONSULTANT,
  contactPreference: ContactPreference.EITHER
};

// Mount

function mountProjectIntakeAssistance(options: { formValues?: Record<string, unknown> } = {}) {
  const { formValues = {} } = options;

  const { wrapper } = mountComponent(ProjectIntakeAssistance, {
    props: { formValues }
  });

  // The button lives inside a `<Teleport to="#app">`, so it's rendered as a
  // sibling of `wrapper`'s own root rather than a descendant of it --
  // `wrapper.find()` can't see it. Search the teleport target directly.
  const getAssistanceButton = () => new DOMWrapper(document.getElementById('app') as HTMLElement).find('button');

  return { wrapper, getAssistanceButton };
}

beforeEach(() => {
  vi.clearAllMocks();

  // `ProjectIntakeAssistance` teleports its content to `#app`, which only
  // exists in the real app shell -- provide a matching target so the
  // teleported button actually mounts into the test DOM.
  const app = document.createElement('div');
  app.id = 'app';
  document.body.appendChild(app);
});

afterEach(() => {
  document.getElementById('app')?.remove();
});

// Tests

describe('ProjectIntakeAssistance', () => {
  describe('rendering', () => {
    it('mounts without error', () => {
      const { wrapper } = mountProjectIntakeAssistance();

      expect(wrapper.exists()).toBe(true);
    });

    it('disables the "Get assistance" button when the contact section is incomplete', () => {
      const { getAssistanceButton } = mountProjectIntakeAssistance({
        formValues: { [IntakeFormCategory.CONTACTS]: {} }
      });

      expect(getAssistanceButton().attributes('disabled')).toBeDefined();
    });

    it('enables the "Get assistance" button once the contact section is valid', () => {
      const { getAssistanceButton } = mountProjectIntakeAssistance({
        formValues: { [IntakeFormCategory.CONTACTS]: validContact }
      });

      expect(getAssistanceButton().attributes('disabled')).toBeUndefined();
    });
  });

  describe('user interaction', () => {
    it('opens a confirmation dialog when clicked', async () => {
      const { getAssistanceButton } = mountProjectIntakeAssistance({
        formValues: { [IntakeFormCategory.CONTACTS]: validContact }
      });

      await getAssistanceButton().trigger('click');

      expect(mockRequire).toHaveBeenCalledOnce();
    });

    it('emits "onSubmitAssistance" once the confirmation dialog is accepted', async () => {
      const { wrapper, getAssistanceButton } = mountProjectIntakeAssistance({
        formValues: { [IntakeFormCategory.CONTACTS]: validContact }
      });

      await getAssistanceButton().trigger('click');

      const confirmArgs = mockRequire.mock.calls[0]?.[0];
      await confirmArgs.accept();

      expect(wrapper.emitted('onSubmitAssistance')).toHaveLength(1);
    });
  });
});
