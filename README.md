<h2 align="center">
<img src="https://github.githubassets.com/images/icons/emoji/unicode/1f4f8.png">
<br>
modern-flash
</h2>

**Modern TypeScript rewrite of [express-flash](https://www.npmjs.com/package/express-flash), allowing data such as error/success notifications to be temporarily stored in the session.**

## Installation

```bash
npm install --save modern-flash
# or
yarn install modern-flash
# or
pnpm install modern-flash
```

## Usage

The default export is `flash()`. This is an Express middleware method, and it must be mounted after mounting session middleware, such as [express-session](https://www.npmjs.com/package/express-session) or [next-session](https://www.npmjs.com/package/next-session). Specifically, when using next-session, make sure to install middleware that sets `req.session`.

Once mounted, request handlers will have a `flash()` function:

### Setting values in the flash store

Simply call `req.flash()` with two arguments. The first is a key to be used when inserting the value into the flashes object of the session. The second is either a string, or an array of strings.

If a key already exists with this name, the value(s) will be appended to the existing array.

```typescript
// Just one value:
req.flash("error", "The florpotron could not be configured. Please contact customer service.");

// Or multiple:
req.flash("error", [
	"I’m sorry, Dave. I’m afraid I can’t do that.",
	"Unshrink you? That would require some sort of a rebigulator!"
]);

// How about another key:
req.flash("success", "Your order has been placed!");
```

### Getting all flashes from the store

Calling `req.flash()` with no arguments will return the entire flashes object from the session.

```typescript
let flashes = req.flash();
res.json(flashes);
```

The above sample would produce the following (prettified) output:

```json
{
	"error": [
		"The florpotron could not be configured. Please contact customer service.",
		"I’m sorry, Dave. I’m afraid I can’t do that.",
		"Unshrink you? That would require some sort of a rebigulator!"
	],

	"success": [
		"Your order has been placed!"
	]
}
```

In addition, this will empty the flashes object in the session, as you’re signalling that you have now sent these messages to the client, hence they are no longer needed.

If you don’t care about the keys and just want the values, you can flatten them into a single array using [`Array.prototype.flat()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat):

```typescript
let flashes = Object.values(req.flash()).flat();
```

You might also find it useful to use destructuring syntax if you know exactly which keys you’re interested in. However, keep in mind that all flashes will still be cleared from the session.

```typescript
let { error, somethingElse } = req.flash();
```

### Getting specific flash keys from the store

As `req.flash()` with no arguments will clear the entire store, you may find it useful to only retrieve specific keys you’re interested in.

```typescript
let errors = req.flash("error");
```

Calling this method will remove the specified key from the store.

### Getting the flashes within templating engines

A `flashes` property is added to the `res.locals` object, for convenience with templating engines that pass this through to your templates.

Accessing the `res.locals.flashes` property is equivalent to calling `req.flash()` – that is, you will clear the flash store by doing so. However, unlike `req.flash()`, once accessed once, subsequent accesses will return a cached value. This allows you to somewhat simplify your templating logic.

Here’s an example of how it could be used from a Pug template:

```pug
if Object.keys(flashes).length > 0
	.alert(role="alert")
		for items in Object.values(flashes)
			for message in items
				p= message
```

Note that `res.locals.flashes` is read-only. Changes made to this object will not have any effect on the flashes object in the session.

### Complete example

```typescript
import express from "express";
import session from "express-session";
import flash from "modern-flash";

const app = express();

// Set up a session. With express-session:
app.use(session({
	// Session config goes here
}));

// …or with next-session:
let getSession = nextSession({
	// Session config goes here
});

// Let modern-flash set itself up in the session:
app.use(flash());

// An example of how you could use it:
app.get("/", async (req, res, next) => {
	// If you use next-session, set the session object before accessing flash():
	req.session = await getSession(req, res);

	let error = req.flash("error");

	// Pretend you’re using a more elaborate templating system than this.
	// This is just for demonstration 🙂
	res.set("Content-Type", "text/html");
	res.end(`
		${error ? `<p>Error: ${error}</p>` : ""}
		<form action="" method="post">
			<button type="submit">Do something</button>
		</form>
	`);
});

app.post("/", (req, res, next) => {
	// Do some hardcore processing magic here…
	// …
	// Oops, something went wrong! Let’s tell the user:
	req.flash("error", "The florpotron could not be configured. Please contact customer service.");
	res.redirect("/");
});

app.listen(3000);
```

## Credits
<p align="center">
<a href="https://chariz.com/">
<img src="https://chariz.com/img/chariz-logo-head@3x.png" width="166" height="60">
</a>
</p>

Developed by [Chariz](https://chariz.com/):

* [Adam Demasi (@kirb)](https://github.com/kirb)
* [Aarnav Tale (@tale)](https://github.com/tale)

## License
Licensed under the Apache License, version 2.0. Refer to [LICENSE.md](https://github.com/chariz/modern-flash/blob/main/LICENSE.md).
