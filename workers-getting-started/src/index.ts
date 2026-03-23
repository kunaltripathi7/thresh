import { Hono } from "hono";

export interface Env {
	AI: Ai;
}

const app = new Hono<{ Bindings: Env }>()

app.get("/", c => {
	return c.json({ hello: "World" })
})

app.post("/messages", async (c) => {
	const body = await c.req.json();
	const prompt = body.prompt;

	if (!prompt) {
		return c.json({ error: "Missing 'prompt' in request body" }, 400);
	}

	// @ts-expect-error - model name might not be in the generated types yet
	const response = await c.env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
		messages: [{ role: "user", content: prompt }]
	});

	return c.json(response);
});

export default app;