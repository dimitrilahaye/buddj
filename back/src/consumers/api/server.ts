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

import errorHandler from "./errorHandler.js";
import { getDefaultMonthlyTemplate } from "./routes/getDefaultMonthlyTemplate.js";
import { createNewMonth } from "./routes/createNewMonth.js";
import { getUnarchivedMonths } from "./routes/getUnarchivedMonths.js";
import { addWeeklyExpense } from "./routes/addWeeklyExpense.js";
import { manageExpensesChecking } from "./routes/manageExpensesChecking.js";
import { manageOutflowsChecking } from "./routes/manageOutflowsChecking.js";
import { archiveMonth } from "./routes/archiveMonth.js";
import { deleteExpense } from "./routes/deleteExpense.js";
import { updateExpense } from "./routes/updateExpense.js";
import { deleteOutflow } from "./routes/deleteOutflow.js";
import { addOutflow } from "./routes/addOutflow.js";
import { getArchivedMonths } from "./routes/getArchivedMonths.js";
import { unarchiveMonth } from "./routes/unarchiveMonth.js";
import { deleteMonth } from "./routes/deleteMonth.js";
import { transferBalanceIntoMonth } from "./routes/transferBalanceIntoMonth.js";
import { getYearlyOutflows } from "./routes/getYearlyOutflows.js";
import { addYearlyOutflow } from "./routes/addYearlyOutflow.js";
import { removeYearlyOutflow } from "./routes/removeYearlyOutflow.js";
import { getAllMonthlyTemplates } from "./routes/getAllMonthlyTemplates.js";
import { updateMonthlyTemplate } from "./routes/updateMonthlyTemplate.js";
import { Deps } from "../../ioc.js";
import { deleteMonthlyOutflow } from "./routes/deleteMonthlyOutflow.js";
import { deleteMonthlyBudget } from "./routes/deleteMonthlyBudget.js";
import { addMonthlyOutflow } from "./routes/addMonthlyOutflow.js";
import { addMonthlyBudget } from "./routes/addMonthlyBudget.js";
import { addBudget } from "./routes/addBudget.js";
import { updateBudget } from "./routes/updateBudget.js";
import { removeBudget } from "./routes/removeBudget.js";
import getAllProjectsByCategory from "./routes/getAllProjectsByCategory.js";
import addAmountProject from "./routes/addAmountProject.js";
import createProject from "./routes/createProject.js";
import getProject from "./routes/getProject.js";
import reApplyProject from "./routes/reApplyProject.js";
import rollbackProject from "./routes/rollbackProject.js";
import removeProject from "./routes/removeProject.js";
import updateProject from "./routes/updateProject.js";

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

function buildApi(
  envVars: Vars,
  setupPassport: SetupPassport,
  dependencies: Deps
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
      deleteMonthUsecase: dependencies.deleteMonthUsecase,
      monthDto: dependencies.monthDto,
      deserializer: dependencies.deleteMonthDeserializer,
    })
  );
  api.use(
    getArchivedMonths(router, {
      getArchivedMonthsUsecase: dependencies.getArchivedMonthsUsecase,
      monthDto: dependencies.monthDto,
    })
  );
  api.use(
    addOutflow(router, {
      addOutflowUsecase: dependencies.addOutflowUsecase,
      monthDto: dependencies.monthDto,
      deserializer: dependencies.addOutflowDeserializer,
    })
  );
  api.use(
    addBudget(router, {
      usecase: dependencies.addBudgetUsecase,
      dto: dependencies.monthDto,
      deserializer: dependencies.addBudgetDeserializer,
    })
  );
  api.use(
    updateBudget(router, {
      usecase: dependencies.updateBudgetUsecase,
      dto: dependencies.monthDto,
      deserializer: dependencies.updateBudgetDeserializer,
    })
  );
  api.use(
    removeBudget(router, {
      usecase: dependencies.removeBudgetUsecase,
      dto: dependencies.monthDto,
    })
  );
  api.use(
    deleteOutflow(router, {
      deleteOutflowUsecase: dependencies.deleteOutflowUsecase,
      monthDto: dependencies.monthDto,
      deserializer: dependencies.deleteOutflowDeserializer,
    })
  );
  api.use(
    deleteExpense(router, {
      deleteExpenseUsecase: dependencies.deleteExpenseUsecase,
      monthDto: dependencies.monthDto,
      deserializer: dependencies.deleteExpenseDeserializer,
    })
  );
  api.use(
    unarchiveMonth(router, {
      unarchiveMonthUsecase: dependencies.unarchiveMonthUsecase,
      monthDto: dependencies.monthDto,
      deserializer: dependencies.unarchiveMonthDeserializer,
    })
  );
  api.use(
    archiveMonth(router, {
      archiveMonthUsecase: dependencies.archiveMonthUsecase,
      monthDto: dependencies.monthDto,
      deserializer: dependencies.archiveMonthDeserializer,
    })
  );
  api.use(
    manageOutflowsChecking(router, {
      manageOutflowsCheckingUsecase: dependencies.manageOutflowsCheckingUsecase,
      monthDto: dependencies.monthDto,
      deserializer: dependencies.manageOutflowCheckingDeserializer,
    })
  );
  api.use(
    manageExpensesChecking(router, {
      manageExpensesCheckingUsecase: dependencies.manageExpensesCheckingUsecase,
      deserializer: dependencies.manageExpenseCheckingDeserializer,
    })
  );
  api.use(
    addWeeklyExpense(router, {
      addWeeklyExpenseUsecase: dependencies.addWeeklyExpenseUsecase,
      deserializer: dependencies.addWeeklyExpenseDeserializer,
    })
  );
  api.use(
    getDefaultMonthlyTemplate(router, {
      usecase: dependencies.getDefaultMonthlyTemplateUsecase,
    })
  );
  api.use(
    updateMonthlyTemplate(router, {
      usecase: dependencies.updateMonthlyTemplateUsecase,
      deserializer: dependencies.updateMonthlyTemplateDeserializer,
    })
  );
  api.use(
    deleteMonthlyOutflow(router, {
      usecase: dependencies.deleteMonthlyOutflowUsecase,
      deserializer: dependencies.deleteMonthlyOutflowDeserializer,
    })
  );
  api.use(
    deleteMonthlyBudget(router, {
      usecase: dependencies.deleteMonthlyBudgetUsecase,
      deserializer: dependencies.deleteMonthlyBudgetDeserializer,
    })
  );
  api.use(
    getAllMonthlyTemplates(router, {
      usecase: dependencies.getAllMonthlyTemplatesUsecase,
    })
  );
  api.use(
    getUnarchivedMonths(router, {
      getUnarchivedMonthsUsecase: dependencies.getUnarchivedMonthsUsecase,
    })
  );
  api.use(
    createNewMonth(router, {
      createNewMonthUsecase: dependencies.createNewMonthUsecase,
      deserializer: dependencies.monthCreationDeserializer,
    })
  );
  api.use(
    addMonthlyOutflow(router, {
      usecase: dependencies.addMonthlyOutflowUsecase,
      deserializer: dependencies.addMonthlyOutflowDeserializer,
    })
  );
  api.use(
    addMonthlyBudget(router, {
      usecase: dependencies.addMonthlyBudgetUsecase,
      deserializer: dependencies.addMonthlyBudgetDeserializer,
    })
  );
  api.use(
    transferBalanceIntoMonth(router, {
      transferBalanceIntoMonthUsecase:
        dependencies.transferBalanceIntoMonthUsecase,
      deserializer: dependencies.transferBalanceIntoMonthDeserializer,
      monthDto: dependencies.monthDto,
    })
  );
  api.use(
    getYearlyOutflows(router, {
      getYearlyOutflows: dependencies.getYearlyOutflowsUsecase,
      yearlyOutflowsDto: dependencies.yearlyOutflowsDto,
    })
  );
  api.use(
    addYearlyOutflow(router, {
      addYearlyOutflow: dependencies.addYearlyOutflowUsecase,
      deserializer: dependencies.addYearlyOutflowDeserializer,
      yearlyOutflowsDto: dependencies.yearlyOutflowsDto,
    })
  );
  api.use(
    removeYearlyOutflow(router, {
      removeYearlyOutflow: dependencies.removeYearlyOutflowUsecase,
      deserializer: dependencies.removeYearlyOutflowDeserializer,
      yearlyOutflowsDto: dependencies.yearlyOutflowsDto,
    })
  );
  api.use(
    getAllProjectsByCategory(router, {
      usecase: dependencies.getAllProjectsByCategoryUsecase,
      dto: dependencies.projectDto,
    })
  );
  api.use(
    addAmountProject(router, {
      usecase: dependencies.addAmountProjectUsecase,
      dto: dependencies.projectDto,
    })
  );
  api.use(
    createProject(router, {
      usecase: dependencies.createProjectUsecase,
      dto: dependencies.projectDto,
    })
  );
  api.use(
    getProject(router, {
      usecase: dependencies.getProjectUsecase,
      dto: dependencies.projectDto,
    })
  );
  api.use(
    reApplyProject(router, {
      usecase: dependencies.reApplyProjectUsecase,
      dto: dependencies.projectDto,
    })
  );
  api.use(
    rollbackProject(router, {
      usecase: dependencies.rollbackProjectUsecase,
      dto: dependencies.projectDto,
    })
  );
  api.use(
    removeProject(router, {
      usecase: dependencies.removeProjectUsecase,
    })
  );
  api.use(
    updateProject(router, {
      usecase: dependencies.updateProjectUsecase,
      dto: dependencies.projectDto,
    })
  );

  /** @deprecated */
  api.use(
    updateExpense(router, {
      updateExpenseUsecase: dependencies.updateExpenseUsecase,
      monthDto: dependencies.monthDto,
    })
  );

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
