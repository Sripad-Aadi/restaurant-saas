const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    console.warn('[validate] Validation failed:', result.error.format());
    const errors = result.error?.errors?.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    })) ?? [];
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  req.body = result.data;
  next();
};

export default validate;