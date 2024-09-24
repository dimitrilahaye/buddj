import http from "node:http";
import request from "supertest";
import {afterEach, beforeEach} from "mocha";
import {authenticate, expect, mockedServer} from "./test-helpers.js";
import {clearDB} from "../providers/test-helpers.js";
import * as deps from "../../../ioc.js";
import {insertArchivedMonth, insertUnarchivedMonth} from "../../utils/persistence/seeds/MonthSeeds.js";

describe("Integration | Consumers | Routes | GET /months/unarchived", function () {
    let server: http.Server;

    describe("When user is authenticated", function () {
        afterEach(async function () {
            server.close();
            await clearDB();
        });

        it("should return an array of unarchived month DTOs", async function () {
            // given
            await insertUnarchivedMonth();
            await insertArchivedMonth();

            server = mockedServer({isAuthenticated: true}, deps);
            const cookie = await authenticate(server);

            // when
            const response = await request(server)
                .get('/months/unarchived')
                .set('Cookie', cookie);

            // then
            expect(response.statusCode).to.be.equal(200);
            expect(response.body.data).to.have.length(1);
        });
    });

    describe("When user is not authenticated", function () {
        beforeEach(async function () {
            server = mockedServer({isAuthenticated: false}, deps);
        });

        afterEach(function () {
            server.close();
        });

        it("should return a 401 error", async function () {
            await request(server).get('/months/unarchived').expect(401);
        });
    });
});
