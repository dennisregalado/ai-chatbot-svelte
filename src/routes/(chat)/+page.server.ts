import { nanoid } from 'nanoid';

export async function load() {
	const id = nanoid();

	return {
		id
	};
}
