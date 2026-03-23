import * as jose from 'jose';

export interface Env {
	JWT_SECRET: string;
}

export default {
	async fetch(request, env, ctx): Promise<Response> {

		const authHeader = request.headers.get("Authorization");

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return new Response("Missing or Invalid Token", { status: 401 });
		}

		const token = authHeader.split(" ")[1];

		try {
			// converting to uint8arr
			const secret = new TextEncoder().encode(env.JWT_SECRET);

			const { payload } = await jose.jwtVerify(token, secret);

		} catch (error) {
			return new Response("Invalid or Expired Token", { status: 401 });
		}

		return new Response('Valid Token!', { status: 200 });
	},
} satisfies ExportedHandler<Env>;
