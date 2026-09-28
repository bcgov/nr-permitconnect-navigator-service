import { Prisma } from '#prismaClient';

// Decimal columns serialize to strings on the wire (Decimal.prototype.toJSON), but arrive from
// Prisma as Decimal instances - converted to strings here so every reader (services, schemas) sees
// the same wire-accurate value instead of relying on implicit JSON serialization.
const toDecimalString = (value: Prisma.Decimal | null) => value?.toString() ?? null;

const numericTransform = Prisma.defineExtension({
  result: {
    document: {
      filesize: {
        compute: ({ filesize }: { filesize: bigint }): number => Number(filesize)
      }
    },
    electrification_project: {
      megawatts: {
        compute: ({ megawatts }: { megawatts: Prisma.Decimal | null }) => toDecimalString(megawatts)
      }
    },
    general_project: {
      latitude: {
        compute: ({ latitude }: { latitude: Prisma.Decimal | null }) => toDecimalString(latitude)
      },
      longitude: {
        compute: ({ longitude }: { longitude: Prisma.Decimal | null }) => toDecimalString(longitude)
      }
    },
    housing_project: {
      latitude: {
        compute: ({ latitude }: { latitude: Prisma.Decimal | null }) => toDecimalString(latitude)
      },
      longitude: {
        compute: ({ longitude }: { longitude: Prisma.Decimal | null }) => toDecimalString(longitude)
      }
    }
  }
});

export default numericTransform;
