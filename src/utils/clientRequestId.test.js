import { createClientRequestId } from './clientRequestId';

describe('createClientRequestId', () => {
  test('uses crypto.randomUUID when the secure-context API is available', () => {
    const randomUUID = jest.fn(() => '00000000-0000-4000-8000-000000000001');

    expect(createClientRequestId({ randomUUID })).toBe('00000000-0000-4000-8000-000000000001');
    expect(randomUUID).toHaveBeenCalledTimes(1);
  });

  test('creates a standards-compatible UUID v4 with getRandomValues on HTTP', () => {
    const getRandomValues = jest.fn((bytes) => {
      bytes.set(Array.from({ length: 16 }, (_, index) => index));
      return bytes;
    });

    expect(createClientRequestId({ getRandomValues })).toBe('00010203-0405-4607-8809-0a0b0c0d0e0f');
    expect(getRandomValues).toHaveBeenCalledTimes(1);
  });

  test('keeps a UUID-compatible fallback when Web Crypto is unavailable', () => {
    expect(createClientRequestId(null)).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });
});
