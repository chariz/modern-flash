import type { NextFunction, Request, RequestHandler, Response } from "express";

// The type of a flash value.
export type FlashValue = string;

// The type of the flash dictionary.
export type FlashDictionary = Record<string, FlashValue[]>;

export interface RequestFlash {
	// Get all flash keys and values, and delete all keys from the session.
	(): FlashDictionary;

	// Get the flash messages for this key, and delete this key from the session.
	(key: string): FlashValue[];

	// Store new flash messages for this key.
	(key: string, value: FlashValue | FlashValue[]): void;
}

declare global {
	namespace Express {
		export interface Request {
			// The flash function for this request.
			readonly flash: RequestFlash;
		}
	}
}

import "./tinyhttp.d";

function reqFlash(
	this: Request,
	key?: string,
	value?: FlashValue | FlashValue[]
): void | FlashValue[] | FlashDictionary {
	if (typeof key === "string" && typeof value !== "undefined") {
		// Store new flash messages for this key.
		let newValues = Array.isArray(value) ? value : [value];
		let flashes = this.session.flash ?? {};
		flashes[key] = [...(flashes[key] ?? []), ...newValues];
		this.session.flash = flashes;
		return;
	} else if (typeof key === "string") {
		// Get the flash messages for this key, and delete this key from the session.
		let result = this.session.flash?.[key];
		if (result !== undefined) {
			delete this.session.flash![key];
		}
		return result ?? [];
	}
	// Get all flash keys and values, and delete all keys from the session.
	let flashes = this.session.flash;
	if (flashes !== undefined) {
		delete this.session.flash;
	}
	return flashes ?? {};
}

function flashMiddleware(req: Request, res: Response, next: NextFunction) {
	if (req.flash === undefined) {
		Object.defineProperty(req, "flash", {
			get: reqFlash.bind(req)
		});

		res.locals.flashes = null;
		res.locals = Object.defineProperty(res.locals, "flashes", {
			get() {
				// Store the flashes in a private temp variable so this local can be read multiple times
				// per request as needed.
				if (res._flashes === undefined) {
					res._flashes = req.flash() ?? null;
				}
				return res._flashes;
			}
		});
	}
	next();
}

// Returns the Express middleware function.
//
// You must call `app.use(flash());` before accessing req.flash() or res.locals.flashes.
export default function flash(): RequestHandler {
	return flashMiddleware;
}
