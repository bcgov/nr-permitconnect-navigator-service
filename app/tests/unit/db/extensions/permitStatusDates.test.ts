import permitStatusDatesTransform from '../../../../src/db/extensions/permitStatusDates.ts';
import { captureExtension } from './captureExtension.ts';

const ext = captureExtension(permitStatusDatesTransform);

const DATE_FIELDS = ['submittedDate', 'decisionDate', 'statusLastVerified', 'statusLastChanged'] as const;
const TIME_FIELDS = ['submittedTime', 'decisionTime', 'statusLastVerifiedTime', 'statusLastChangedTime'] as const;

describe('permitStatusDates extension — write transforms', () => {
  describe('permit.create', () => {
    it('converts YYYY-MM-DD strings on date fields into Date objects (UTC midnight)', async () => {
      const query = vi.fn().mockResolvedValue('ok');
      const args = {
        data: { submittedDate: '2024-05-10', decisionDate: '2024-06-01' }
      };

      await ext.query.permit.create({ args, query });

      const forwarded = query.mock.calls[0][0].data;
      expect(forwarded.submittedDate).toBeInstanceOf(Date);
      expect(forwarded.submittedDate.toISOString()).toBe('2024-05-10T00:00:00.000Z');
      expect(forwarded.decisionDate.toISOString()).toBe('2024-06-01T00:00:00.000Z');
    });

    it('converts HH:MM:SSZ strings on time fields into Date objects (epoch date)', async () => {
      const query = vi.fn().mockResolvedValue('ok');
      const args = { data: { submittedTime: '08:30:00Z' } };

      await ext.query.permit.create({ args, query });

      const forwarded = query.mock.calls[0][0].data;
      expect(forwarded.submittedTime).toBeInstanceOf(Date);
      expect(forwarded.submittedTime.toISOString()).toBe('1970-01-01T08:30:00.000Z');
    });

    it('leaves already-converted Date values alone', async () => {
      const query = vi.fn().mockResolvedValue('ok');
      const existing = new Date('2024-05-10T00:00:00.000Z');
      const args = { data: { submittedDate: existing } };

      await ext.query.permit.create({ args, query });

      expect(query.mock.calls[0][0].data.submittedDate).toBe(existing);
    });

    it('skips normalization when args.data is missing', async () => {
      const query = vi.fn().mockResolvedValue('ok');
      await ext.query.permit.create({ args: {}, query });
      expect(query).toHaveBeenCalledWith({});
    });
  });

  describe('permit.update', () => {
    it('normalizes args.data the same way as create', async () => {
      const query = vi.fn().mockResolvedValue('ok');
      const args = { data: { decisionDate: '2024-06-01' } };

      await ext.query.permit.update({ args, query });

      expect(query.mock.calls[0][0].data.decisionDate).toBeInstanceOf(Date);
    });
  });

  describe('permit.upsert', () => {
    it('normalizes both args.create and args.update', async () => {
      const query = vi.fn().mockResolvedValue('ok');
      const args = {
        create: { submittedDate: '2024-01-02' },
        update: { decisionDate: '2024-02-03' }
      };

      await ext.query.permit.upsert({ args, query });

      const forwarded = query.mock.calls[0][0];
      expect(forwarded.create.submittedDate).toBeInstanceOf(Date);
      expect(forwarded.create.submittedDate.toISOString()).toBe('2024-01-02T00:00:00.000Z');
      expect(forwarded.update.decisionDate).toBeInstanceOf(Date);
      expect(forwarded.update.decisionDate.toISOString()).toBe('2024-02-03T00:00:00.000Z');
    });

    it('passes through when neither create nor update is provided', async () => {
      const query = vi.fn().mockResolvedValue('ok');
      await ext.query.permit.upsert({ args: { where: { permitId: 'p' } }, query });
      expect(query).toHaveBeenCalledWith({ where: { permitId: 'p' } });
    });

    it('only normalizes args.create when args.update is missing', async () => {
      const query = vi.fn().mockResolvedValue('ok');
      await ext.query.permit.upsert({ args: { create: { submittedDate: '2024-01-02' } }, query });

      const forwarded = query.mock.calls[0][0];
      expect(forwarded.create.submittedDate).toBeInstanceOf(Date);
      expect(forwarded.update).toBeUndefined();
    });

    it('only normalizes args.update when args.create is missing', async () => {
      const query = vi.fn().mockResolvedValue('ok');
      await ext.query.permit.upsert({ args: { update: { decisionDate: '2024-02-03' } }, query });

      const forwarded = query.mock.calls[0][0];
      expect(forwarded.update.decisionDate).toBeInstanceOf(Date);
      expect(forwarded.create).toBeUndefined();
    });
  });
});

describe('permitStatusDates extension — read transforms', () => {
  it.each(DATE_FIELDS)('formats permit.%s as YYYY-MM-DD', (field) => {
    const computed = ext.result.permit[field].compute({ [field]: new Date('2024-05-10T12:34:56.000Z') });
    expect(computed).toBe('2024-05-10');
  });

  it.each(DATE_FIELDS)('returns null when permit.%s is null', (field) => {
    expect(ext.result.permit[field].compute({ [field]: null })).toBeNull();
  });

  it.each(TIME_FIELDS)('formats permit.%s as HH:MM:SS.sssZ', (field) => {
    const computed = ext.result.permit[field].compute({ [field]: new Date('1970-01-01T08:30:15.250Z') });
    expect(computed).toBe('08:30:15.250Z');
  });

  it.each(TIME_FIELDS)('returns null when permit.%s is null', (field) => {
    expect(ext.result.permit[field].compute({ [field]: null })).toBeNull();
  });

  it('declares the underlying field in `needs` for every computed result', () => {
    for (const field of [...DATE_FIELDS, ...TIME_FIELDS]) {
      expect(ext.result.permit[field].needs).toEqual({ [field]: true });
    }
  });
});
