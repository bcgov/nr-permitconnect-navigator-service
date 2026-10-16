import { flushPromises, mount } from '@vue/test-utils';
import { useForm } from 'vee-validate';
import { defineComponent } from 'vue';
import { z } from 'zod';

import { toTypedSchema } from '@/utils/zodSchema';

// Mocks

// Fixtures

const testSchema = z.object({
  basic: z.object({ projectName: z.string().trim().min(1, 'Project name is required') }),
  housing: z.object({ hasRentalUnits: z.string(), rentalUnits: z.string().nullish() }).superRefine((value, ctx) => {
    if (value.hasRentalUnits === 'Yes' && !value.rentalUnits) {
      ctx.addIssue({ code: 'custom', path: ['rentalUnits'], message: 'Rental units are required' });
    }
  }),
  permits: z.array(z.object({ permitTypeId: z.number('Permit type is required') }))
});

const validValues = {
  basic: { projectName: '  Project  ' },
  housing: { hasRentalUnits: 'No' },
  permits: [{ permitTypeId: 1 }]
};

// Mount

function mountForm() {
  let form!: ReturnType<typeof useForm>;
  mount(
    defineComponent({
      setup() {
        form = useForm({ validationSchema: toTypedSchema(testSchema) });
        return () => null;
      }
    })
  );
  return form;
}

// Tests

describe('toTypedSchema', () => {
  describe('parse', () => {
    it('returns the parsed output when valid', async () => {
      expect(await toTypedSchema(testSchema).parse(validValues)).toEqual({
        value: { ...validValues, basic: { projectName: 'Project' } },
        errors: []
      });
    });

    it('maps issues to vee-validate field paths, including refinements and array indices', async () => {
      const { value, errors } = await toTypedSchema(testSchema).parse({
        basic: { projectName: ' ' },
        housing: { hasRentalUnits: 'Yes' },
        permits: [{ permitTypeId: 1 }, {}]
      } as never);

      expect(value).toBeUndefined();
      expect(errors).toEqual([
        { path: 'basic.projectName', errors: ['Project name is required'] },
        { path: 'housing.rentalUnits', errors: ['Rental units are required'] },
        { path: 'permits[1].permitTypeId', errors: ['Permit type is required'] }
      ]);
    });

    it('groups multiple issues on the same path', async () => {
      const schema = z.object({ code: z.string().min(3, 'Too short').regex(/^\d+$/, 'Digits only') });

      expect((await toTypedSchema(schema).parse({ code: 'a' })).errors).toEqual([
        { path: 'code', errors: ['Too short', 'Digits only'] }
      ]);
    });

    it('maps root level issues to an empty path', async () => {
      expect((await toTypedSchema(z.string('Required')).parse(undefined as never)).errors).toEqual([
        { path: '', errors: ['Required'] }
      ]);
    });
  });

  describe('vee-validate integration', () => {
    it('reports errors through useForm', async () => {
      const form = mountForm();
      form.setValues({ basic: { projectName: '' }, housing: { hasRentalUnits: 'Yes' }, permits: [] });

      const result = await form.validate();

      expect(result.valid).toBe(false);
      expect(result.errors).toEqual({
        'basic.projectName': 'Project name is required',
        'housing.rentalUnits': 'Rental units are required'
      });
    });

    it('hands submit handlers the parsed output', async () => {
      const form = mountForm();
      const onSubmit = vi.fn();
      form.setValues(validValues);

      await form.handleSubmit(onSubmit)();
      await flushPromises();

      expect(onSubmit).toHaveBeenCalledWith({ ...validValues, basic: { projectName: 'Project' } }, expect.anything());
    });
  });
});
