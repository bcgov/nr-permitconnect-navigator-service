import ProjectFilesTab from '@/components/projectCommon/ProjectFilesTab.vue';
import DocumentCard from '@/components/file/DocumentCard.vue';
import FileUpload from '@/components/file/FileUpload.vue';
import { documentService } from '@/services';
import { GroupName, Initiative } from '@/utils/enums/application';
import { ApplicationStatus } from '@/utils/enums/projectCommon';

import { mountComponent } from '../../../mountComponent';

import type { Document } from '@/types';

// Mocks

const downloadDocumentSpy = vi.spyOn(documentService, 'downloadDocument');

// Fixtures

function testDocument(overrides: Partial<Document> = {}): Document {
  return {
    documentId: 'doc-1',
    activityId: 'activity-1',
    filename: 'test.pdf',
    extension: 'pdf',
    mimeType: 'application/pdf',
    filesize: 1024,
    createdByFullName: 'Jane Doe',
    createdAt: '2024-01-01T00:00:00.000Z',
    ...overrides
  } as Document;
}

// Mount

function mountProjectFilesTab(
  options: {
    project?: Record<string, unknown> | null;
    documents?: Document[];
    projectIsCompleted?: boolean;
    canAccess?: boolean;
  } = {}
) {
  const {
    project = { activityId: 'activity-1', projectId: 'project-1' },
    documents = [],
    projectIsCompleted = false,
    canAccess = true
  } = options;

  // getProjectIsCompleted is derived from project.applicationStatus, not a
  // separate state field -- set it there to control the getter.
  const projectWithStatus = {
    ...project,
    ...(projectIsCompleted ? { applicationStatus: ApplicationStatus.COMPLETED } : {})
  };

  const { wrapper } = mountComponent(ProjectFilesTab, {
    piniaState: {
      app: { initiative: Initiative.HOUSING },
      authz: { permissions: [], groups: canAccess ? [{ name: GroupName.DEVELOPER }] : [] },
      project: { project: projectWithStatus, documents }
    },
    stubs: { FileUpload: true, DocumentCard: true, DeleteDocument: true }
  });

  return { wrapper };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// Tests

describe('ProjectFilesTab', () => {
  describe('rendering', () => {
    it('renders the FileUpload when the project has an activityId', () => {
      const { wrapper } = mountProjectFilesTab({ project: { activityId: 'activity-1' } });

      expect(wrapper.findComponent(FileUpload).exists()).toBe(true);
      expect(wrapper.findComponent(FileUpload).props('activityId')).toBe('activity-1');
    });

    it('does not render the FileUpload when the project has no activityId', () => {
      const { wrapper } = mountProjectFilesTab({ project: {} });

      expect(wrapper.findComponent(FileUpload).exists()).toBe(false);
    });

    it.each([
      { projectIsCompleted: true, canAccess: true, expectedDisabled: true },
      { projectIsCompleted: false, canAccess: false, expectedDisabled: true },
      { projectIsCompleted: false, canAccess: true, expectedDisabled: false }
    ])(
      'sets FileUpload disabled=$expectedDisabled when completed=$projectIsCompleted and canCreate=$canAccess',
      ({ projectIsCompleted, canAccess, expectedDisabled }) => {
        const { wrapper } = mountProjectFilesTab({ projectIsCompleted, canAccess });

        expect(wrapper.findComponent(FileUpload).props('disabled')).toBe(expectedDisabled);
      }
    );

    it('renders a table row per document with formatted size and date', () => {
      const { wrapper } = mountProjectFilesTab({ documents: [testDocument()] });

      const text = wrapper.find('table').text();
      expect(text).toContain('test.pdf');
      expect(text).toContain('Jane Doe');
      expect(text).not.toContain('1024');
    });

    it('sorts documents by createdAt descending by default', () => {
      const older = testDocument({ documentId: 'doc-old', filename: 'old.pdf', createdAt: '2023-01-01T00:00:00Z' });
      const newer = testDocument({ documentId: 'doc-new', filename: 'new.pdf', createdAt: '2024-06-01T00:00:00Z' });

      const { wrapper } = mountProjectFilesTab({ documents: [older, newer] });

      const rows = wrapper.findAll('tbody tr');
      expect(rows[0]!.text()).toContain('new.pdf');
      expect(rows[1]!.text()).toContain('old.pdf');
    });

    it('filters documents by filename via the search box', async () => {
      const { wrapper } = mountProjectFilesTab({
        documents: [
          testDocument({ documentId: 'doc-1', filename: 'alpha.pdf' }),
          testDocument({ documentId: 'doc-2', filename: 'beta.pdf' })
        ]
      });

      await wrapper.find('input[placeholder="Search"]').setValue('alpha');

      const text = wrapper.find('table').text();
      expect(text).toContain('alpha.pdf');
      expect(text).not.toContain('beta.pdf');
    });

    it('switches to grid view and renders a DocumentCard per document', async () => {
      const { wrapper } = mountProjectFilesTab({ documents: [testDocument()] });
      expect(wrapper.findComponent(DocumentCard).exists()).toBe(false);

      await wrapper.find('button[aria-label="Grid"]').trigger('click');

      expect(wrapper.findComponent(DocumentCard).props('document')).toEqual(testDocument());
    });

    it('switches back to list view', async () => {
      const { wrapper } = mountProjectFilesTab({ documents: [testDocument()] });

      await wrapper.find('button[aria-label="Grid"]').trigger('click');
      await wrapper.find('button[aria-label="List"]').trigger('click');

      expect(wrapper.findComponent(DocumentCard).exists()).toBe(false);
    });
  });

  describe('user interaction', () => {
    it('downloads the document when its filename link is clicked and the user has read permission', async () => {
      const { wrapper } = mountProjectFilesTab({ documents: [testDocument()], canAccess: true });

      await wrapper.find('table a').trigger('click');

      expect(downloadDocumentSpy).toHaveBeenCalledWith({ documentId: 'doc-1', filename: 'test.pdf' });
    });

    it('does not download the document when the user lacks read permission', async () => {
      const { wrapper } = mountProjectFilesTab({ documents: [testDocument()], canAccess: false });

      await wrapper.find('table a').trigger('click');

      expect(downloadDocumentSpy).not.toHaveBeenCalled();
    });
  });
});
