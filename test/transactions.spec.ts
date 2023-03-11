import {
    test,
    beforeAll,
    afterAll,
    describe,
    expect,
    beforeEach,
} from "vitest";
import { execSync } from "node:child_process";
import request from "supertest";
import { app } from "../src/app";

describe("transactions routes", () => {
    beforeAll(async () => {
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        execSync("npm run knex migrate:rollback --all");
        execSync("npm run knex migrate:latest");
    });

    test("user can create a new transaction", async () => {
        await request(app.server)
            .post("/transactions")
            .send({ title: "New Transaction", amount: 5000, type: "credit" })
            .expect(201);
    });

    test("user can list all transactions", async () => {
        const createTransactionResponse = await request(app.server)
            .post("/transactions")
            .send({ title: "New Transaction", amount: 5000, type: "credit" });

        const cookies = createTransactionResponse.get("Set-Cookie");

        const listTransactionsResponse = await request(app.server)
            .get("/transactions")
            .set("Cookie", cookies)
            .expect(200);

        expect(listTransactionsResponse.body.transactions).toEqual([
            expect.objectContaining({
                title: "New Transaction",
                amount: 5000,
            }),
        ]);
    });
});
