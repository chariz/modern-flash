import type { NextFunction, Request, RequestHandler, Response } from "express";
import "./tinyhttp.d";

/** The type of a flash value. */
export type FlashValue = string;

/** The type of the flash dictionary. */
export type FlashDictionary = Record<string, FlashValue[]>;

/** Overloads of req.flash(). */
export interface RequestFlash {
	/**
	 * Get all flash keys and values, and delete all keys from the session.
	 * @returns All flash messages in the session, ordered by their key.
	 */
	(): FlashDictionary;

	/**
	 * Get the flash messages for key, and delete key from the session.
	 * @param key Key to retrieve flash messages for.
	 * @returns Flash messages in the session matching this key.
	 */
	(key: string): FlashValue[];

	/**
	 * Store new flash messages for this key.
	 * @param key Key to store message(s) for.
	 * @param value A single value or array of values to store in the flash key.
	 */
	(key: string, value: FlashValue | FlashValue[]): void;
}

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Express {
		export interface Request {
			/** The flash function for this request. */
			readonly flash: RequestFlash;
		}
	}
}

function reqFlash(
	this: Request,
	key?: string,
	value?: FlashValue | FlashValue[]
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
): void | FlashValue[] | FlashDictionary {
	if (typeof key === "string" && value !== undefined) {
		// Store new flash messages for this key.
		const newValues = Array.isArray(value) ? value : [value];
		const flashes = this.session.flash ?? {};
		flashes[key] = [...(flashes[key] ?? []), ...newValues];
		this.session.flash = flashes;
		return;
	} else if (typeof key === "string") {
		// Get the flash messages for this key, and delete this key from the session.
		const result = this.session.flash?.[key];
		if (result !== undefined) {
			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			delete this.session.flash![key];
		}
		return result ?? [];
	}
	// Get all flash keys and values, and delete all keys from the session.
	const flashes = this.session.flash;
	if (flashes !== undefined) {
		delete this.session.flash;
	}
	return flashes ?? {};
}

function flashMiddleware(req: Request, res: Response, next: NextFunction) {
	if (req.flash === undefined) {
		const boundFlash = reqFlash.bind(req);
		Object.defineProperty(req, "flash", {
			get: () => boundFlash
		});

		res.locals.flashes = null;
		res.locals = Object.defineProperty(res.locals, "flashes", {
			get() {
				// Store the flashes in a private temp variable so this local can be read multiple times
				// per request as needed.
				if (res._flashes === undefined) {
					res._flashes = req.flash()!;
				}
				return res._flashes;
			}
		});
	}
	next();
}

/**
 * Attaches modern-flash to the router.
 * You must call `app.use(flash());` before accessing `req.flash()` or `res.locals.flashes`.
 * @returns Express middleware function
 */
export default function flash(): RequestHandler {
	return flashMiddleware;
}
