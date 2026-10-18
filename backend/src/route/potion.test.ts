import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../index.js";
import { potionSchema } from "../schema/potion.js";
import { isApproved, VERB } from "../data/ingredient.js";

const app = createApp();
const APPROVED_VERB = new Set<string>(VERB);

describe("POST /api/potion", () => {
  it("brews a potion and returns the envelope (AC7/AC10)", async () => {
    const res = await request(app)
      .post("/api/potion")
      .send({ trouble: "i miss someone" });

    expect(res.status).toBe(200);
    expect(res.body.generator).toBe("offline");
    expect(potionSchema.safeParse(res.body.potion).success).toBe(true);

    // Every served ingredient is in the data (AC1).
    for (const name of res.body.potion.ingredient) {
      expect(isApproved(name), name).toBe(true);
    }
    // Every step uses an approved verb and in-potion ingredients (AC5).
    const inPotion = new Set<string>(res.body.potion.ingredient);
    for (const step of res.body.potion.step) {
      expect(APPROVED_VERB.has(step.verb), step.verb).toBe(true);
      for (const name of step.ingredient) {
        expect(inPotion.has(name), name).toBe(true);
      }
    }
  });

  it("rejects an empty trouble with 400 and the error shape (AC6)", async () => {
    const res = await request(app).post("/api/potion").send({ trouble: "" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("invalid_trouble");
    expect(typeof res.body.error.message).toBe("string");
    expect(typeof res.body.requestId).toBe("string");
    expect(res.body.potion).toBeUndefined();
  });

  it("rejects a whitespace-only trouble with 400 (AC6)", async () => {
    const res = await request(app)
      .post("/api/potion")
      .send({ trouble: "   \t  " });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("invalid_trouble");
  });

  it("rejects a missing trouble field with 400 (AC6)", async () => {
    const res = await request(app).post("/api/potion").send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("invalid_trouble");
  });
});
