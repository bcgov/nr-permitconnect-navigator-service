import { mockReset } from 'vitest-mock-extended';

import { TEST_IDIR_USER_1 } from '../data/index.ts';
import { mockRepos } from '../../__mocks__/unitOfWorkMock.ts';
import { DuplicateKeyProblem } from '../../../src/db/errors.ts';
import { createUser, updateUser } from '../../../src/domains/user.ts';
import { IdentityProviderKind } from '../../../src/utils/enums/application.ts';

import type { JwtUser } from '../../../src/services/login.ts';

describe('user domain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReset(mockRepos);
  });

  describe('createUser', () => {
    it('should return existing user if user with same sub already exists', async () => {
      // Mocking the constraint violation thrown by the database
      const duplicateError = Object.create(DuplicateKeyProblem.prototype);
      duplicateError.isConstraint = vi.fn().mockReturnValue(true);

      mockRepos.user.create.mockRejectedValue(duplicateError);
      mockRepos.user.findBySub.mockResolvedValue(TEST_IDIR_USER_1 as never);

      const jwtData: JwtUser = {
        sub: TEST_IDIR_USER_1.sub,
        email: 'new@example.com',
        fullName: 'New Name',
        firstName: 'New',
        lastName: 'Name',
        idp: IdentityProviderKind.AZUREIDIR,
        bceidBusinessName: null,
        active: true
      };

      const result = await createUser(mockRepos, jwtData);

      expect(result).toEqual(TEST_IDIR_USER_1);
      expect(mockRepos.user.findBySub).toHaveBeenCalledWith(TEST_IDIR_USER_1.sub);
      expect(mockRepos.identityProvider.createIfNotExists).toHaveBeenCalledWith(
        { idp: IdentityProviderKind.AZUREIDIR },
        { idp: IdentityProviderKind.AZUREIDIR }
      );
    });

    it('should create new user when user does not exist', async () => {
      const newUser = {
        ...TEST_IDIR_USER_1,
        userId: 'new-user-id'
      };

      mockRepos.user.create.mockResolvedValue(newUser as never);

      const jwtData: JwtUser = {
        sub: 'new-sub-123',
        email: newUser.email,
        fullName: newUser.fullName,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        idp: IdentityProviderKind.AZUREIDIR,
        bceidBusinessName: null,
        active: true
      };

      const result = await createUser(mockRepos, jwtData);

      expect(result).toEqual(newUser);
      expect(mockRepos.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          bceidBusinessName: null,
          userId: expect.any(String),
          sub: 'new-sub-123',
          fullName: newUser.fullName,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          idp: IdentityProviderKind.AZUREIDIR,
          active: true
        })
      );
    });

    it('should create identity provider if idp is provided and does not exist', async () => {
      const newUser = { ...TEST_IDIR_USER_1, userId: 'new-user-id' };
      mockRepos.user.create.mockResolvedValue(newUser as never);

      const jwtData: JwtUser = {
        sub: 'new-sub-456',
        email: newUser.email,
        fullName: newUser.fullName,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        idp: IdentityProviderKind.AZUREIDIR,
        bceidBusinessName: null,
        active: true
      };

      await createUser(mockRepos, jwtData);

      expect(mockRepos.identityProvider.createIfNotExists).toHaveBeenCalledWith(
        { idp: IdentityProviderKind.AZUREIDIR },
        { idp: IdentityProviderKind.AZUREIDIR }
      );
    });

    it('should not create identity provider if idp is not provided', async () => {
      const newUser = { ...TEST_IDIR_USER_1, userId: 'new-user-id', idp: null };
      mockRepos.user.create.mockResolvedValue(newUser as never);

      const jwtData: JwtUser = {
        sub: 'new-sub-999',
        email: newUser.email,
        fullName: newUser.fullName,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        idp: null,
        bceidBusinessName: null,
        active: true
      };

      await createUser(mockRepos, jwtData);

      expect(mockRepos.identityProvider.createIfNotExists).not.toHaveBeenCalled();
    });

    it('should set active status to true for new user', async () => {
      const newUser = { ...TEST_IDIR_USER_1, userId: 'new-user-id', active: true };
      mockRepos.user.create.mockResolvedValue(newUser as never);

      const jwtData: JwtUser = {
        sub: 'new-sub-active',
        email: newUser.email,
        fullName: newUser.fullName,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        idp: null,
        bceidBusinessName: null,
        active: true
      };

      await createUser(mockRepos, jwtData);

      const createCall = mockRepos.user.create.mock.calls[0]?.[0];
      expect(createCall?.active).toBe(true);
    });

    it('should throw 500 when sub duplicate exists but user cannot be found', async () => {
      const duplicateError = Object.create(DuplicateKeyProblem.prototype);
      duplicateError.isConstraint = vi.fn().mockReturnValue(true);

      mockRepos.user.create.mockRejectedValue(duplicateError);
      mockRepos.user.findBySub.mockResolvedValue(null as never);

      const jwtData: JwtUser = {
        sub: 'ghost-sub',
        email: 'test@example.com',
        fullName: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        idp: null,
        bceidBusinessName: null,
        active: true
      };

      try {
        await createUser(mockRepos, jwtData);
        expect(true).toBe(false); // Fail if it reaches here
      } catch (error: unknown) {
        const problem = error as { status: number; detail: string };
        expect(problem.status).toBe(500);
        expect(problem.detail).toBe(
          'User creation failed with a duplicate "sub", but no matching user could be found.'
        );
      }
    });
  });

  describe('updateUser', () => {
    it('should return existing user when no changes detected', async () => {
      mockRepos.user.findById.mockResolvedValue(TEST_IDIR_USER_1 as never);

      const jwtData: JwtUser = {
        sub: TEST_IDIR_USER_1.sub,
        email: TEST_IDIR_USER_1.email,
        fullName: TEST_IDIR_USER_1.fullName,
        firstName: TEST_IDIR_USER_1.firstName,
        lastName: TEST_IDIR_USER_1.lastName,
        idp: TEST_IDIR_USER_1.idp,
        bceidBusinessName: TEST_IDIR_USER_1.bceidBusinessName,
        active: true
      };

      const result = await updateUser(mockRepos, TEST_IDIR_USER_1.userId, jwtData);

      expect(result).toEqual(TEST_IDIR_USER_1);
      expect(mockRepos.user.update).not.toHaveBeenCalled();
    });

    it('should update user when changes detected in email', async () => {
      const updatedUser = { ...TEST_IDIR_USER_1, email: 'newemail@example.com' };

      mockRepos.user.findById.mockResolvedValue(TEST_IDIR_USER_1 as never);
      mockRepos.user.update.mockResolvedValue(updatedUser as never);

      const jwtData: JwtUser = {
        sub: TEST_IDIR_USER_1.sub,
        email: 'newemail@example.com',
        fullName: TEST_IDIR_USER_1.fullName,
        firstName: TEST_IDIR_USER_1.firstName,
        lastName: TEST_IDIR_USER_1.lastName,
        idp: TEST_IDIR_USER_1.idp,
        bceidBusinessName: TEST_IDIR_USER_1.bceidBusinessName,
        active: true
      };

      const result = await updateUser(mockRepos, TEST_IDIR_USER_1.userId, jwtData);

      expect(result).toEqual(updatedUser);
      expect(mockRepos.user.update).toHaveBeenCalledWith(
        { userId: TEST_IDIR_USER_1.userId },
        expect.objectContaining({ email: 'newemail@example.com' })
      );
    });

    it('should update user when changes detected in fullName', async () => {
      const updatedUser = { ...TEST_IDIR_USER_1, fullName: 'Doe, Jane' };

      mockRepos.user.findById.mockResolvedValue(TEST_IDIR_USER_1 as never);
      mockRepos.user.update.mockResolvedValue(updatedUser as never);

      const jwtData: JwtUser = {
        sub: TEST_IDIR_USER_1.sub,
        email: TEST_IDIR_USER_1.email,
        fullName: 'Doe, Jane',
        firstName: TEST_IDIR_USER_1.firstName,
        lastName: TEST_IDIR_USER_1.lastName,
        idp: TEST_IDIR_USER_1.idp,
        bceidBusinessName: TEST_IDIR_USER_1.bceidBusinessName,
        active: true
      };

      await updateUser(mockRepos, TEST_IDIR_USER_1.userId, jwtData);

      expect(mockRepos.user.update).toHaveBeenCalled();
    });

    it('should update user when active status changes', async () => {
      const oldUser = { ...TEST_IDIR_USER_1, active: true };
      const updatedUser = { ...TEST_IDIR_USER_1, active: false };

      mockRepos.user.findById.mockResolvedValue(oldUser as never);
      mockRepos.user.update.mockResolvedValue(updatedUser as never);

      const jwtData: JwtUser = {
        sub: TEST_IDIR_USER_1.sub,
        email: TEST_IDIR_USER_1.email,
        fullName: TEST_IDIR_USER_1.fullName,
        firstName: TEST_IDIR_USER_1.firstName,
        lastName: TEST_IDIR_USER_1.lastName,
        idp: TEST_IDIR_USER_1.idp,
        bceidBusinessName: TEST_IDIR_USER_1.bceidBusinessName,
        active: false
      };

      await updateUser(mockRepos, TEST_IDIR_USER_1.userId, jwtData);

      expect(mockRepos.user.update).toHaveBeenCalled();
      const updateCall = mockRepos.user.update.mock.calls[0]?.[1];
      expect(updateCall?.active).toBe(false);
    });

    it('should create identity provider if idp is provided and does not exist when updating', async () => {
      const oldUser = { ...TEST_IDIR_USER_1, idp: null };
      const updatedUser = { ...TEST_IDIR_USER_1, idp: IdentityProviderKind.AZUREIDIR };

      mockRepos.user.findById.mockResolvedValue(oldUser as never);
      mockRepos.user.update.mockResolvedValue(updatedUser as never);

      const jwtData: JwtUser = {
        sub: TEST_IDIR_USER_1.sub,
        email: TEST_IDIR_USER_1.email,
        fullName: TEST_IDIR_USER_1.fullName,
        firstName: TEST_IDIR_USER_1.firstName,
        lastName: TEST_IDIR_USER_1.lastName,
        idp: IdentityProviderKind.AZUREIDIR,
        bceidBusinessName: TEST_IDIR_USER_1.bceidBusinessName,
        active: true
      };

      await updateUser(mockRepos, TEST_IDIR_USER_1.userId, jwtData);

      expect(mockRepos.identityProvider.createIfNotExists).toHaveBeenCalledWith(
        { idp: IdentityProviderKind.AZUREIDIR },
        { idp: IdentityProviderKind.AZUREIDIR }
      );
      expect(mockRepos.user.update).toHaveBeenCalled();
    });

    it('should throw 404 when user not found', async () => {
      mockRepos.user.findById.mockResolvedValue(null as never);

      const jwtData: JwtUser = {
        sub: 'some-sub',
        email: 'test@example.com',
        fullName: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        idp: null,
        bceidBusinessName: null,
        active: true
      };

      try {
        await updateUser(mockRepos, 'nonexistent-user-id', jwtData);
        expect(true).toBe(false); // Fail if it reaches here
      } catch (error: unknown) {
        expect((error as { status: number }).status).toBe(404);
      }
    });

    it('should update multiple user properties at once', async () => {
      const updatedUser = {
        ...TEST_IDIR_USER_1,
        email: 'changed@example.com',
        fullName: 'Doe, John Changed',
        firstName: 'John',
        lastName: 'Doe Changed'
      };

      mockRepos.user.findById.mockResolvedValue(TEST_IDIR_USER_1 as never);
      mockRepos.user.update.mockResolvedValue(updatedUser as never);

      const jwtData: JwtUser = {
        sub: TEST_IDIR_USER_1.sub,
        email: 'changed@example.com',
        fullName: 'Doe, John Changed',
        firstName: 'John',
        lastName: 'Doe Changed',
        idp: TEST_IDIR_USER_1.idp,
        bceidBusinessName: TEST_IDIR_USER_1.bceidBusinessName,
        active: true
      };

      await updateUser(mockRepos, TEST_IDIR_USER_1.userId, jwtData);

      expect(mockRepos.user.update).toHaveBeenCalled();
      const updateCall = mockRepos.user.update.mock.calls[0]?.[1];
      expect(updateCall?.email).toBe('changed@example.com');
      expect(updateCall?.fullName).toBe('Doe, John Changed');
      expect(updateCall?.lastName).toBe('Doe Changed');
    });
  });
});
