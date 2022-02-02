import { FlashDictionary } from ".";

declare global {
	namespace Express {
		interface Response {
			// Private - do not access directly.
			_flashes: FlashDictionary | null;
		}
	}
}

declare module "express-session" {
	interface SessionData {
		// The underlying dictionary of flashes.
		flash?: FlashDictionary;
	}
}
