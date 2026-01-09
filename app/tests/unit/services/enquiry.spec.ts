import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import { TEST_CURRENT_CONTEXT, TEST_ENQUIRY_1 } from '../data/index.ts';
import * as enquiryService from '../../../src/services/enquiry.ts';
import { generateDeleteStamps } from '../../../src/db/utils/utils.ts';
import { IntakeStatus } from '../../../src/utils/enums/projectCommon.ts';
import { Initiative } from '../../../src/utils/enums/application.ts';

beforeEach(() => {
  jest.resetAllMocks();
});

describe('createEnquiry', () => {
  it('calls enquiry.create and returns result', async () => {
    prismaTxMock.enquiry.create.mockResolvedValueOnce(TEST_ENQUIRY_1);

    const response = await enquiryService.createEnquiry(prismaTxMock, TEST_ENQUIRY_1);

    expect(prismaTxMock.enquiry.create).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.enquiry.create).toHaveBeenCalledWith({
      data: TEST_ENQUIRY_1,
      include: {
        activity: {
          include: {
            activityContact: {
              include: {
                contact: true
              }
            }
          }
        }
      }
    });
    expect(response).toStrictEqual(TEST_ENQUIRY_1);
  });
});

describe('deleteEnquiry', () => {
  it('calls enquiry.update', async () => {
    prismaTxMock.enquiry.update.mockResolvedValueOnce(TEST_ENQUIRY_1);

    await enquiryService.deleteEnquiry(prismaTxMock, '1', generateDeleteStamps(TEST_CURRENT_CONTEXT));

    expect(prismaTxMock.enquiry.delete).not.toHaveBeenCalled();
    expect(prismaTxMock.enquiry.update).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.enquiry.update).toHaveBeenCalledWith({
      data: { deletedAt: expect.any(Date) as Date, deletedBy: TEST_CURRENT_CONTEXT.userId },
      where: { enquiryId: '1' }
    });
  });
});

describe('getEnquiry', () => {
  it('calls electrification_project.findFirstOrThrow and returns result', async () => {
    prismaTxMock.enquiry.findFirstOrThrow.mockResolvedValueOnce(TEST_ENQUIRY_1);

    const response = await enquiryService.getEnquiry(prismaTxMock, '1');

    expect(prismaTxMock.enquiry.findFirstOrThrow).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.enquiry.findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        enquiryId: '1'
      },
      include: {
        activity: {
          include: {
            activityContact: {
              include: {
                contact: true
              }
            }
          }
        }
      }
    });
    expect(response).toStrictEqual(TEST_ENQUIRY_1);
  });
});

describe('getEnquiries', () => {
  it('calls electrification_project.findMany and returns result', async () => {
    prismaTxMock.enquiry.findMany.mockResolvedValueOnce([TEST_ENQUIRY_1]);

    const response = await enquiryService.getEnquiries(prismaTxMock);

    expect(prismaTxMock.enquiry.findMany).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.enquiry.findMany).toHaveBeenCalledWith({
      include: {
        activity: {
          include: {
            activityContact: {
              include: {
                contact: true
              }
            }
          }
        },
        user: true
      }
    });
    expect(response).toStrictEqual([TEST_ENQUIRY_1]);
  });
});

describe('searchEnquiries', () => {
  it('calls electrification_project.findMany and returns result', async () => {
    prismaTxMock.enquiry.findMany.mockResolvedValueOnce([TEST_ENQUIRY_1]);

    const response = await enquiryService.searchEnquiries(prismaTxMock, {}, Initiative.HOUSING);

    expect(prismaTxMock.enquiry.findMany).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.enquiry.findMany).toHaveBeenCalledWith({
      where: {
        AND: [
          {
            activity: {
              initiative: {
                code: Initiative.HOUSING
              }
            }
          },
          {
            activityId: { in: undefined }
          },
          {
            createdBy: { in: undefined }
          },
          {
            enquiryId: { in: undefined }
          }
        ]
      },
      include: {
        activity: {
          include: {
            activityContact: {
              include: {
                contact: true
              }
            },
            initiative: true
          }
        }
      }
    });
    expect(response).toStrictEqual([TEST_ENQUIRY_1]);
  });

  it('passes parameters', async () => {
    prismaTxMock.enquiry.findMany.mockResolvedValueOnce([TEST_ENQUIRY_1]);

    const params = {
      activityId: ['123'],
      createdBy: ['456'],
      enquiryId: ['789'],
      includeUser: true
    };

    const response = await enquiryService.searchEnquiries(prismaTxMock, params, Initiative.HOUSING);

    expect(prismaTxMock.enquiry.findMany).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.enquiry.findMany).toHaveBeenCalledWith({
      where: {
        AND: [
          {
            activity: {
              initiative: {
                code: Initiative.HOUSING
              }
            }
          },
          {
            activityId: { in: params.activityId }
          },
          {
            createdBy: { in: params.createdBy }
          },
          {
            enquiryId: { in: params.enquiryId }
          }
        ]
      },
      include: {
        activity: {
          include: {
            activityContact: {
              include: {
                contact: true
              }
            },
            initiative: true
          }
        },
        user: params.includeUser
      }
    });
    expect(response).toStrictEqual([TEST_ENQUIRY_1]);
  });
});

describe('getRelatedEnquiries', () => {
  it('calls enquiry.findMany and returns result', async () => {
    prismaTxMock.enquiry.findMany.mockResolvedValueOnce([TEST_ENQUIRY_1]);

    const response = await enquiryService.getRelatedEnquiries(prismaTxMock, '123');

    expect(prismaTxMock.enquiry.findMany).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.enquiry.findMany).toHaveBeenCalledWith({
      where: {
        relatedActivityId: '123'
      },
      include: {
        activity: {
          include: {
            activityContact: {
              include: {
                contact: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    expect(response).toStrictEqual([TEST_ENQUIRY_1]);
  });
});

describe('updateEnquiry', () => {
  it('calls enquiry.update with correct data and returns result', async () => {
    prismaTxMock.enquiry.update.mockResolvedValueOnce(TEST_ENQUIRY_1);

    const response = await enquiryService.updateEnquiry(prismaTxMock, TEST_ENQUIRY_1);

    expect(prismaTxMock.enquiry.update).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.enquiry.update).toHaveBeenCalledWith({
      data: TEST_ENQUIRY_1,
      where: {
        enquiryId: TEST_ENQUIRY_1.enquiryId
      },
      include: {
        activity: {
          include: {
            activityContact: {
              include: {
                contact: true
              }
            }
          }
        }
      }
    });
    expect(response).toStrictEqual(TEST_ENQUIRY_1);
  });
});
