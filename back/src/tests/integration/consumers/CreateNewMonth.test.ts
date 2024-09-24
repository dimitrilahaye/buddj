import http from "node:http";
import request from "supertest";
import {afterEach, beforeEach} from "mocha";
import sinon from "sinon";
import {authenticate, expect, mockedServer} from "./test-helpers.js";
import {clearDB} from "../providers/test-helpers.js";
import * as deps from "../../../ioc.js";
import MonthCreationCommand from "../../../consumers/api/commands/MonthCreationCommand.js";
import MonthCreationCommandError from "../../../consumers/api/errors/MonthCreationCommandError.js";
import {MonthDao} from "../../../providers/persistence/entities/Month.js";

describe("Integration | Consumers | Routes | POST /months", function () {
    let server: http.Server;

    describe("When user is authenticated", function () {
        afterEach(async function () {
            server.close();
            await clearDB();
        });

        it("should have persisted new month and return a month DTO", async function () {
            // given
            server = mockedServer({isAuthenticated: true}, deps);
            const cookie = await authenticate(server);
            const body = {
                month: new Date(),
                startingBalance: 2000,
                outflows: [
                    {
                        label: 'outlfow',
                        amount: 10.05,
                    },
                ],
                weeklyBudgets: [
                    {
                        name: 'Semaine 1',
                        initialBalance: 200,
                    },
                    {
                        name: 'Semaine 2',
                        initialBalance: 200,
                    },
                    {
                        name: 'Semaine 3',
                        initialBalance: 200,
                    },
                    {
                        name: 'Semaine 4',
                        initialBalance: 200,
                    },
                    {
                        name: 'Semaine 5',
                        initialBalance: 200,
                    },
                ],
            };

            // when
            const response = await request(server)
                .post('/months')
                .send(body)
                .set('Cookie', cookie);

            // then
            expect(response.statusCode).to.be.equal(201);
            const [, countOfMonthsPersisted] = await MonthDao.findAndCount();
            expect(countOfMonthsPersisted).to.be.equal(1);
        });

        it("should return 400 error if body was malformed", async function () {
            // given
            const commandStub = sinon.stub(MonthCreationCommand, 'toCommand');
            commandStub.throwsException(new MonthCreationCommandError('message'));
            server = mockedServer({isAuthenticated: true}, deps);
            const cookie = await authenticate(server);
            const body = {
                month: new Date(),
                startingBalance: 2000,
                outflows: [
                    {
                        label: 'outlfow',
                        amount: 10.05,
                    },
                ],
                weeklyBudgets: [
                    {
                        name: 'Semaine 1',
                        initialBalance: 200,
                    },
                    {
                        name: 'Semaine 2',
                        initialBalance: 200,
                    },
                    {
                        name: 'Semaine 3',
                        initialBalance: 200,
                    },
                    {
                        name: 'Semaine 4',
                        initialBalance: 200,
                    },
                    {
                        name: 'Semaine 5',
                        initialBalance: 200,
                    },
                ],
            };

            // when
            const response = await request(server)
                .post('/months')
                .send(body)
                .set('Cookie', cookie);

            // then
            expect(response.statusCode).to.be.equal(400);
            expect(response.body.success).to.be.false;
            const [, countOfMonthsPersisted] = await MonthDao.findAndCount();
            expect(countOfMonthsPersisted).to.be.equal(0);
            commandStub.restore();
        });

        it("should return 422 error if core models encountered business error", async function () {
            // given
            server = mockedServer({isAuthenticated: true}, deps);
            const cookie = await authenticate(server);
            const body = {
                month: new Date(),
                startingBalance: -2000,
                outflows: [
                    {
                        label: 'outlfow',
                        amount: 10.05,
                    },
                ],
                weeklyBudgets: [
                    {
                        name: 'Semaine 1',
                        initialBalance: 200,
                    },
                    {
                        name: 'Semaine 2',
                        initialBalance: 200,
                    },
                    {
                        name: 'Semaine 3',
                        initialBalance: 200,
                    },
                    {
                        name: 'Semaine 4',
                        initialBalance: 200,
                    },
                    {
                        name: 'Semaine 5',
                        initialBalance: 200,
                    },
                ],
            };

            // when
            const response = await request(server)
                .post('/months')
                .send(body)
                .set('Cookie', cookie);

            // then
            expect(response.statusCode).to.be.equal(422);
            expect(response.body.success).to.be.false;
            const [, countOfMonthsPersisted] = await MonthDao.findAndCount();
            expect(countOfMonthsPersisted).to.be.equal(0);
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
            await request(server).post('/months').expect(401);
        });
    });
});
