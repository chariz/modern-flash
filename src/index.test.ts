import { describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";
import flash from "./index";
import type { FlashDictionary } from "./index";

const createMockArgs = (flashes?: FlashDictionary): [Request, Response, NextFunction] => {
	const req = {
		session: {
			flash: flashes
		}
	} as unknown as Request;
	const res = {
		locals: {}
	} as unknown as Response;
	const next = vi.fn();

	const middleware = flash();
	middleware(req, res, next);

	return [req, res, next];
};

describe("middleware", () => {
	it("attaches to request", () => {
		const [req, _res, _next] = createMockArgs();

		expect(req.flash)
			.toBeDefined();
		expect(typeof req.flash)
			.toBe("function");
	});

	it("does not reinit on multiple use", () => {
		const [req, res, next] = createMockArgs();

		const flash1 = req.flash;
		const middleware = flash();
		middleware(req, res, next);
		const flash2 = req.flash;

		expect(flash1)
			.toStrictEqual(flash2);
	});

	it("calls next", () => {
		const [_req, _res, next] = createMockArgs();
		expect(next)
			.toHaveBeenCalled();
	});
});

describe("req.flash", () => {
	it("handles empty session", () => {
		const [req, _res, _next] = createMockArgs();

		expect(req.session.flash)
			.toBeUndefined();

		const flashes = req.flash();
		expect(flashes)
			.toEqual({});

		expect(req.session.flash)
			.toBeUndefined();
	});

	it("reads all from session", () => {
		const [req, _res, _next] = createMockArgs({
			foo: ["bar", "baz"],
			error: ["oh no"]
		});

		const flashes = req.flash();

		expect(flashes)
			.toEqual({
				foo: ["bar", "baz"],
				error: ["oh no"]
			});
	});

	it("reads key from session", () => {
		const [req, _res, _next] = createMockArgs({
			foo: ["bar", "baz"],
			error: ["oh no"]
		});

		const flashes = req.flash("error");

		expect(flashes)
			.toEqual(["oh no"]);
	});

	it("sets new key in session", () => {
		const [req, _res, _next] = createMockArgs({
			foo: ["bar", "baz"],
			error: ["oh no"]
		});

		req.flash("success", "awesome");
		const flashes = req.flash("success");

		expect(flashes)
			.toEqual(["awesome"]);
	});

	it("appends to key in session", () => {
		const [req, _res, _next] = createMockArgs({
			foo: ["bar", "baz"],
			error: ["oh no"]
		});

		req.flash("error", "yikes");
		req.flash("error", ["damn", "oh well"]);
		const flashes = req.flash("error");

		expect(flashes)
			.toEqual(["oh no", "yikes", "damn", "oh well"]);
	});

	it("deletes key from session", () => {
		const [req, _res, _next] = createMockArgs({
			foo: ["bar", "baz"],
			error: ["oh no"]
		});

		req.flash("error");
		expect(req.session.flash)
			.not.toHaveProperty("error");

		const flashes = req.flash("error");
		expect(flashes)
			.toEqual([]);
	});

	it("deletes all flashes from session", () => {
		const [req, _res, _next] = createMockArgs({
			foo: ["bar", "baz"],
			error: ["oh no"]
		});

		req.flash();
		expect(req.session.flash)
			.toEqual(undefined);

		const flashes = req.flash();
		expect(flashes)
			.toEqual({});
	});
});

describe("res.locals.flashes", () => {
	it("handles empty session", () => {
		const [_req, res, _next] = createMockArgs();

		expect(res._flashes)
			.toBeUndefined();

		const flashes = res.locals.flashes;
		expect(flashes)
			.toEqual({});
		expect(res._flashes)
			.toEqual({});
	});

	it("reads all from session", () => {
		const [_req, res, _next] = createMockArgs({
			foo: ["bar", "baz"],
			error: ["oh no"]
		});

		const flashes = res.locals.flashes;

		expect(flashes)
			.toEqual({
				foo: ["bar", "baz"],
				error: ["oh no"]
			});
	});

	it("reads key from session", () => {
		const [_req, res, _next] = createMockArgs({
			foo: ["bar", "baz"],
			error: ["oh no"]
		});

		const flashes = res.locals.flashes["error"];

		expect(flashes)
			.toEqual(["oh no"]);
	});

	it("is cached", () => {
		const [req, res, _next] = createMockArgs({
			foo: ["bar", "baz"],
			error: ["oh no"]
		});

		expect(res._flashes)
			.toBeUndefined();

		const flashes1 = res.locals.flashes;
		req.flash("success", "awesome");
		const flashes2 = res.locals.flashes;

		expect(flashes1)
			.toStrictEqual(flashes2);
		expect(flashes1)
			.toStrictEqual(res._flashes);
	});

	it("deletes all flashes from session", () => {
		const [req, res, _next] = createMockArgs({
			foo: ["bar", "baz"],
			error: ["oh no"]
		});

		const flashes1 = res.locals.flashes;
		expect(flashes1)
			.toEqual({
				foo: ["bar", "baz"],
				error: ["oh no"]
			});

		const flashes2 = req.flash();
		expect(flashes2)
			.toEqual({});
	});
});
