import { Context, Effect, Layer, ManagedRuntime } from 'effect';

export class Clock extends Context.Service<Clock, { readonly now: () => Date }>()('app/Clock') {}

export const ClockLive = Layer.succeed(Clock, { now: () => new Date() });

const AppLive = Layer.mergeAll(ClockLive);

export const runtime = ManagedRuntime.make(AppLive);

export type AppServices = ManagedRuntime.ManagedRuntime.Services<typeof runtime>;

export function run<A, E>(program: Effect.Effect<A, E, AppServices>): Promise<A> {
	return runtime.runPromise(program);
}

export const today = Effect.gen(function* () {
	const clock = yield* Clock;
	return clock.now().toISOString().slice(0, 10);
});
