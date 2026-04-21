declare module 'yup' {
  interface StringSchema<TType, TContext, TDefault, TFlags> {
    emptyToNull(): StringSchema<TType | null, TContext, TDefault, TFlags>;
  }
}
