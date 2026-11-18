import { Effect, Layer } from 'effect';
import { describe, expect, it } from 'vitest';
import { Clock, today } from './runtime';

describe('today', () => {
	it('reads the date from the clock it is given', async () => {
		const fixed = Layer.succeed(Clock, { now: () => new Date('2026-03-04T12:00:00Z') });

		const result = await Effect.runPromise(Effect.provide(today, fixed));

		expect(result).toBe('2026-03-04');
	});
});
