import * as jose from 'jose';
export interface Env {
	JWT_SECRET: string;
	THRESH_BACKEND_URL: string;
	RATE_LIMITER: any;
	EDGE_SECRET: string;
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);

		const path = url.pathname;
		const newRequest = new Request(env.THRESH_BACKEND_URL + path, request);
		newRequest.headers.append("X-Edge-Token", env.EDGE_SECRET);

		if (url.pathname === "/api/health" || url.pathname == "/api/public") return fetch(newRequest);

		const authHeader = request.headers.get("Authorization");

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return new Response("Missing or Invalid Token", { status: 401 });
		}

		const token = authHeader.split(" ")[1];

		let result;
		try {
			// converting to uint8arr
			const secret = new TextEncoder().encode(env.JWT_SECRET);
			const { payload } = await jose.jwtVerify(token, secret);
			result = payload;
		} catch (error) {
			return new Response("Invalid or Expired Token", { status: 401 });
		}

		const ip = request.headers.get("CF-Connecting-IP") || "anonymous";
		const { success } = await env.RATE_LIMITER.limit({ key: ip });
		if (!success) return new Response("Rate limit exceeded", { status: 429 });
		newRequest.headers.append("X-User-Id", String(result.sub));
		const response = await fetch(newRequest);
		return response;
	},
} satisfies ExportedHandler<Env>;
