import { generateUUID } from '$lib/utils'; 

export async function load() { 
	const id = generateUUID();

	return {
		id
	};
}
