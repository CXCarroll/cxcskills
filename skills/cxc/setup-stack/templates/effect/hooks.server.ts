import { runtime } from '#lib/server/runtime.js';

process.on('sveltekit:shutdown', () => {
	void runtime.dispose();
});
