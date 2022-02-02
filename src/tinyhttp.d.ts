import { IncomingMessage, OutgoingMessage } from "http";
import { FlashDictionary, RequestFlash } from ".";

declare module "@tinyhttp/app" {
	export interface Request extends IncomingMessage {
		flash: RequestFlash;
	}

	export interface Response extends OutgoingMessage {
		locals: {
			readonly flashes: FlashDictionary;
		};
	}
}
