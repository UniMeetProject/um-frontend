import {
  DAY_END_MIN,
  DAY_START_MIN,
  intervalToBlocks,
  isValidRange,
  toHHMM,
  toMinutes,
} from '@/lib/time';

describe('time helpers', () => {
  it('converts HH:MM to minutes from midnight', () => {
    expect(toMinutes('00:00')).toBe(0);
    expect(toMinutes('08:00')).toBe(480);
    expect(toMinutes('19:45')).toBe(1185);
  });

  it('round-trips HH:MM through minutes', () => {
    expect(toHHMM(0)).toBe('00:00');
    expect(toHHMM(480)).toBe('08:00');
    expect(toHHMM(1185)).toBe('19:45');
  });

  it('rejects malformed and out-of-day times', () => {
    expect(() => toMinutes('8:00')).toThrow('Invalid HH:MM time');
    expect(() => toMinutes('24:00')).toThrow('Invalid HH:MM time');
    expect(() => toMinutes('10:60')).toThrow('Invalid HH:MM time');
  });

  it('accepts only increasing ranges inside the editable day', () => {
    expect(isValidRange('08:00', '09:00')).toBe(true);
    expect(isValidRange('10:00', '10:00')).toBe(false);
    expect(isValidRange('10:00', '09:00')).toBe(false);
    expect(isValidRange('07:45', '09:00')).toBe(false);
    expect(isValidRange('08:00', '20:15')).toBe(false);
  });

  it('maps one hour to four half-open blocks', () => {
    expect(intervalToBlocks('08:00', '09:00')).toEqual([0, 1, 2, 3]);
  });

  it('clamps intervals to the editable day', () => {
    expect(intervalToBlocks('07:30', '08:30')).toEqual([0, 1]);
    expect(intervalToBlocks('19:30', '21:00')).toEqual([46, 47]);
  });

  it('uses exclusive end semantics at the day boundary', () => {
    expect(intervalToBlocks('08:00', '20:00')).toHaveLength(48);
    expect(intervalToBlocks('19:45', '20:00')).toEqual([47]);
  });

  it('defines the expected day constants', () => {
    expect(DAY_START_MIN).toBe(480);
    expect(DAY_END_MIN).toBe(1200);
  });
});
