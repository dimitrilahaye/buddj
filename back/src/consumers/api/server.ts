import express, {
  Express,
  NextFunction,
  Request,
  Response,
  Router,
} from "express";
import cors from "cors";
import cookieSession from "cookie-session";
import passport from "passport";

import UserRepository from "../../providers/persistence/repositories/UserRepository.js";
import { getMonthTemplate } from "./routes/monthTemplate.js";
import GetMonthCreationTemplate from "../../core/usecases/GetMonthCreationTemplate.js";
import errorHandler from "./errorHandler.js";
import { createNewMonth } from "./routes/createNewMonth.js";
import CreateNewMonth from "../../core/usecases/CreateNewMonth.js";
import { getUnarchivedMonths } from "./routes/getUnarchivedMonths.js";
import GetUnarchivedMonths from "../../core/usecases/GetUnarchivedMonths.js";
import { addWeeklyExpense } from "./routes/addWeeklyExpense.js";
import AddWeeklyExpense from "../../core/usecases/AddWeeklyExpense.js";
import ManageExpensesChecking from "../../core/usecases/ManageExpensesChecking.js";
import { manageExpensesChecking } from "./routes/manageExpensesChecking.js";
import ManageOutflowsChecking from "../../core/usecases/ManageOutflowsChecking.js";
import { MonthDtoBuilder } from "./dtos/monthDto.js";
import { manageOutflowsChecking } from "./routes/manageOutflowsChecking.js";
import ArchiveMonth from "../../core/usecases/ArchiveMonth.js";
import { archiveMonth } from "./routes/archiveMonth.js";
import DeleteExpense from "../../core/usecases/DeleteExpense.js";
import { deleteExpense } from "./routes/deleteExpense.js";
import UpdateExpense from "../../core/usecases/UpdateExpense.js";
import { updateExpense } from "./routes/updateExpense.js";
import DeleteOutflow from "../../core/usecases/DeleteOutflow.js";
import { deleteOutflow } from "./routes/deleteOutflow.js";
import AddOutflow from "../../core/usecases/AddOutflow.js";
import { addOutflow } from "./routes/addOutflow.js";
import GetArchivedMonths from "../../core/usecases/GetArchivedMonths.js";
import { getArchivedMonths } from "./routes/getArchivedMonths.js";
import UnarchiveMonth from "../../core/usecases/UnarchiveMonth.js";
import { unarchiveMonth } from "./routes/unarchiveMonth.js";
import DeleteMonth from "../../core/usecases/DeleteMonth.js";
import { deleteMonth } from "./routes/deleteMonth.js";
import { AddOutflowDeserializer } from "./deserializers/addOutflow.js";
import { AddWeeklyExpenseDeserializer } from "./deserializers/addWeeklyExpense.js";
import { ArchiveMonthDeserializer } from "./deserializers/archiveMonth.js";
import { DeleteExpenseDeserializer } from "./deserializers/deleteExpense.js";
import { DeleteMonthDeserializer } from "./deserializers/deleteMonth.js";
import { DeleteOutflowDeserializer } from "./deserializers/deleteOutflow.js";
import { MonthCreationDeserializer } from "./deserializers/monthCreation.js";
import { UnarchiveMonthDeserializer } from "./deserializers/unarchiveMonth.js";
import { ManageExpensesCheckingDeserializer } from "./deserializers/manageExpenseChecking.js";
import { ManageOutflowsCheckingDeserializer } from "./deserializers/manageOutflowChecking.js";
import TransferBalanceIntoMonth from "../../core/usecases/TransferBalanceIntoMonth.js";
import { TransferBalanceIntoMonthDeserializer } from "./deserializers/transferBalanceIntoMonth.js";
import { transferBalanceIntoMonth } from "./routes/transferBalanceIntoMonth.js";
import GetYearlyOutflows from "../../core/usecases/GetYearlyOutflows.js";
import { getYearlyOutflows } from "./routes/getYearlyOutflows.js";
import { YearlyOutflowsDtoBuilder } from "./dtos/yearlyOutflowsDto.js";

declare global {
  namespace Express {
    interface Request {
      // @ts-ignore
      user: User;
    }

    interface User {
      googleId: string;
      name: string;
      email: string;
    }
  }
}

type Vars = {
  nodeEnv: string;
  port: number;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string;
  scriptId: string;
  sessionSecret: string;
  frontUrl: string;
  frontRedirectUrl: string;
  dbUrl: string;
  dbPort: number;
  dbUser: string;
  dbPassword: string;
  dbName: string;
  template: any;
};

type SetupPassport = (api: Express) => void;

export type Deps = {
  userRepository: UserRepository;
  monthDto: MonthDtoBuilder;
  yearlyOutflowsDto: YearlyOutflowsDtoBuilder;
  getMonthCreationTemplateUsecase: GetMonthCreationTemplate;
  createNewMonthUsecase: CreateNewMonth;
  getUnarchivedMonthsUsecase: GetUnarchivedMonths;
  addWeeklyExpenseUsecase: AddWeeklyExpense;
  manageExpensesCheckingUsecase: ManageExpensesChecking;
  manageOutflowsCheckingUsecase: ManageOutflowsChecking;
  archiveMonthUsecase: ArchiveMonth;
  deleteExpenseUsecase: DeleteExpense;
  updateExpenseUsecase: UpdateExpense;
  deleteOutflowUsecase: DeleteOutflow;
  addOutflowUsecase: AddOutflow;
  getArchivedMonthsUsecase: GetArchivedMonths;
  unarchiveMonthUsecase: UnarchiveMonth;
  deleteMonthUsecase: DeleteMonth;
  transferBalanceIntoMonthUsecase: TransferBalanceIntoMonth;
  getYearlyOutflowsUsecase: GetYearlyOutflows;
  addOutflowDeserializer: AddOutflowDeserializer;
  addWeeklyExpenseDeserializer: AddWeeklyExpenseDeserializer;
  archiveMonthDeserializer: ArchiveMonthDeserializer;
  deleteExpenseDeserializer: DeleteExpenseDeserializer;
  deleteMonthDeserializer: DeleteMonthDeserializer;
  deleteOutflowDeserializer: DeleteOutflowDeserializer;
  manageExpenseCheckingDeserializer: ManageExpensesCheckingDeserializer;
  manageOutflowCheckingDeserializer: ManageOutflowsCheckingDeserializer;
  monthCreationDeserializer: MonthCreationDeserializer;
  unarchiveMonthDeserializer: UnarchiveMonthDeserializer;
  transferBalanceIntoMonthDeserializer: TransferBalanceIntoMonthDeserializer;
};

function buildApi(
  envVars: Vars,
  setupPassport: SetupPassport,
  {
    monthDto,
    yearlyOutflowsDto,
    getMonthCreationTemplateUsecase,
    getUnarchivedMonthsUsecase,
    createNewMonthUsecase,
    addWeeklyExpenseUsecase,
    manageExpensesCheckingUsecase,
    manageOutflowsCheckingUsecase,
    archiveMonthUsecase,
    deleteExpenseUsecase,
    updateExpenseUsecase,
    deleteOutflowUsecase,
    addOutflowUsecase,
    getArchivedMonthsUsecase,
    unarchiveMonthUsecase,
    deleteMonthUsecase,
    transferBalanceIntoMonthUsecase,
    getYearlyOutflowsUsecase,
    addOutflowDeserializer,
    addWeeklyExpenseDeserializer,
    archiveMonthDeserializer,
    deleteExpenseDeserializer,
    deleteMonthDeserializer,
    deleteOutflowDeserializer,
    manageExpenseCheckingDeserializer,
    manageOutflowCheckingDeserializer,
    monthCreationDeserializer,
    unarchiveMonthDeserializer,
    transferBalanceIntoMonthDeserializer,
  }: Deps
) {
  const api = express();

  api.use(express.json());
  api.use(
    cors({
      origin: envVars.frontUrl,
      credentials: true,
    })
  );
  if (envVars.nodeEnv === "production") {
    api.set("trust proxy", 1);
  }

  api.use(
    cookieSession({
      secret: envVars.sessionSecret,
      maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years lul
      secure: envVars.nodeEnv === "production",
      sameSite: ["development", "test"].includes(envVars.nodeEnv as string)
        ? true
        : "none",
      name: "mkapi",
      httpOnly: true,
      // @ts-ignore
      proxy: envVars.nodeEnv === "production",
    })
  );

  // register regenerate & save after the cookieSession middleware initialization
  api.use(function (request, response, next) {
    if (request.session && !request.session.regenerate) {
      request.session.regenerate = (cb: any) => {
        cb();
      };
    }
    if (request.session && !request.session.save) {
      request.session.save = (cb: any) => {
        cb();
      };
    }
    next();
  });

  setupPassport(api);

  const router: Router = Router();

  router.get("/health", (req, res) => {
    const data = {
      uptime: process.uptime(),
      message: "Ok",
      date: new Date(),
    };

    res.status(200).send(data);
  });

  // accessType seems not to be a property of auth options
  router.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: envVars.scopes.split(" "),
      // @ts-ignore
      accessType: "offline",
      prompt: "consent",
    })
  );
  router.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/",
      successRedirect: envVars.frontRedirectUrl,
    })
  );

  const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
    if (
      req.user ||
      req.path.includes("auth/google") ||
      req.path.includes("health")
    ) {
      next();
    } else {
      res.sendStatus(401);
    }
  };

  router.get("/auth/logout", isLoggedIn, function (req, res, next) {
    req.logout(function (err) {
      if (err) return next(err);
      res.status(200).send({});
    });
  });

  api.use(isLoggedIn);

  api.use(
    deleteMonth(router, {
      deleteMonthUsecase,
      monthDto,
      deserializer: deleteMonthDeserializer,
    })
  );
  api.use(getArchivedMonths(router, { getArchivedMonthsUsecase, monthDto }));
  api.use(
    addOutflow(router, {
      addOutflowUsecase,
      monthDto,
      deserializer: addOutflowDeserializer,
    })
  );
  api.use(
    deleteOutflow(router, {
      deleteOutflowUsecase,
      monthDto,
      deserializer: deleteOutflowDeserializer,
    })
  );
  api.use(
    deleteExpense(router, {
      deleteExpenseUsecase,
      monthDto,
      deserializer: deleteExpenseDeserializer,
    })
  );
  api.use(
    unarchiveMonth(router, {
      unarchiveMonthUsecase,
      monthDto,
      deserializer: unarchiveMonthDeserializer,
    })
  );
  api.use(
    archiveMonth(router, {
      archiveMonthUsecase,
      monthDto,
      deserializer: archiveMonthDeserializer,
    })
  );
  api.use(
    manageOutflowsChecking(router, {
      manageOutflowsCheckingUsecase,
      monthDto,
      deserializer: manageOutflowCheckingDeserializer,
    })
  );
  api.use(
    manageExpensesChecking(router, {
      manageExpensesCheckingUsecase,
      deserializer: manageExpenseCheckingDeserializer,
    })
  );
  api.use(
    addWeeklyExpense(router, {
      addWeeklyExpenseUsecase,
      deserializer: addWeeklyExpenseDeserializer,
    })
  );
  api.use(getMonthTemplate(router, { getMonthCreationTemplateUsecase }));
  api.use(getUnarchivedMonths(router, { getUnarchivedMonthsUsecase }));
  api.use(
    createNewMonth(router, {
      createNewMonthUsecase,
      deserializer: monthCreationDeserializer,
    })
  );
  api.use(
    transferBalanceIntoMonth(router, {
      transferBalanceIntoMonthUsecase,
      deserializer: transferBalanceIntoMonthDeserializer,
      monthDto,
    })
  );
  api.use(
    getYearlyOutflows(router, {
      getYearlyOutflows: getYearlyOutflowsUsecase,
      yearlyOutflowsDto,
    })
  );

  /** @deprecated */
  api.use(updateExpense(router, { updateExpenseUsecase, monthDto }));

  router.get("/me", isLoggedIn, async (req, res) => {
    try {
      res.send(req.user);
    } catch (e: any) {
      res.status(500).send(e.message);
    }
  });

  api.use(router);
  api.use(errorHandler);

  const PORT = envVars.port || 8080;
  const server = api.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  return server;
}

export default buildApi;
