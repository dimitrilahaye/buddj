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
import routes from "./routes/index.js";
import { Deps } from "../../ioc/index.js";

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
    routes.month.deleteMonth(router, {
      deleteMonthUsecase: dependencies.deleteMonthUsecase,
      monthDto: dependencies.monthDto,
      deserializer: dependencies.deleteMonthDeserializer,
    })
  );
  api.use(
    routes.month.getArchivedMonths(router, {
      getArchivedMonthsUsecase: dependencies.getArchivedMonthsUsecase,
      monthDto: dependencies.monthDto,
    })
  );
  api.use(
    routes.month.addOutflow(router, {
      addOutflowUsecase: dependencies.addOutflowUsecase,
      monthDto: dependencies.monthDto,
      deserializer: dependencies.addOutflowDeserializer,
    })
  );
  api.use(
    routes.month.addBudget(router, {
      usecase: dependencies.addBudgetUsecase,
      dto: dependencies.monthDto,
      deserializer: dependencies.addBudgetDeserializer,
    })
  );
  api.use(
    routes.month.updateBudget(router, {
      usecase: dependencies.updateBudgetUsecase,
      dto: dependencies.monthDto,
      deserializer: dependencies.updateBudgetDeserializer,
    })
  );
  api.use(
    routes.month.removeBudget(router, {
      usecase: dependencies.removeBudgetUsecase,
      dto: dependencies.monthDto,
    })
  );
  api.use(
    routes.month.deleteOutflow(router, {
      deleteOutflowUsecase: dependencies.deleteOutflowUsecase,
      monthDto: dependencies.monthDto,
      deserializer: dependencies.deleteOutflowDeserializer,
    })
  );
  api.use(
    routes.month.deleteExpense(router, {
      deleteExpenseUsecase: dependencies.deleteExpenseUsecase,
      monthDto: dependencies.monthDto,
      deserializer: dependencies.deleteExpenseDeserializer,
    })
  );
  api.use(
    routes.month.unarchiveMonth(router, {
      unarchiveMonthUsecase: dependencies.unarchiveMonthUsecase,
      monthDto: dependencies.monthDto,
      deserializer: dependencies.unarchiveMonthDeserializer,
    })
  );
  api.use(
    routes.month.archiveMonth(router, {
      archiveMonthUsecase: dependencies.archiveMonthUsecase,
      monthDto: dependencies.monthDto,
      deserializer: dependencies.archiveMonthDeserializer,
    })
  );
  api.use(
    routes.month.manageOutflowsChecking(router, {
      manageOutflowsCheckingUsecase: dependencies.manageOutflowsCheckingUsecase,
      monthDto: dependencies.monthDto,
      deserializer: dependencies.manageOutflowCheckingDeserializer,
    })
  );
  api.use(
    routes.month.manageExpensesChecking(router, {
      manageExpensesCheckingUsecase: dependencies.manageExpensesCheckingUsecase,
      deserializer: dependencies.manageExpenseCheckingDeserializer,
    })
  );
  api.use(
    routes.month.addWeeklyExpense(router, {
      addWeeklyExpenseUsecase: dependencies.addWeeklyExpenseUsecase,
      deserializer: dependencies.addWeeklyExpenseDeserializer,
    })
  );
  api.use(
    routes.monthlyTemplate.getDefaultMonthlyTemplate(router, {
      usecase: dependencies.getDefaultMonthlyTemplateUsecase,
    })
  );
  api.use(
    routes.monthlyTemplate.updateMonthlyTemplate(router, {
      usecase: dependencies.updateMonthlyTemplateUsecase,
      deserializer: dependencies.updateMonthlyTemplateDeserializer,
    })
  );
  api.use(
    routes.monthlyTemplate.deleteMonthlyOutflow(router, {
      usecase: dependencies.deleteMonthlyOutflowUsecase,
      deserializer: dependencies.deleteMonthlyOutflowDeserializer,
    })
  );
  api.use(
    routes.monthlyTemplate.deleteMonthlyBudget(router, {
      usecase: dependencies.deleteMonthlyBudgetUsecase,
      deserializer: dependencies.deleteMonthlyBudgetDeserializer,
    })
  );
  api.use(
    routes.monthlyTemplate.getAllMonthlyTemplates(router, {
      usecase: dependencies.getAllMonthlyTemplatesUsecase,
    })
  );
  api.use(
    routes.month.getUnarchivedMonths(router, {
      getUnarchivedMonthsUsecase: dependencies.getUnarchivedMonthsUsecase,
    })
  );
  api.use(
    routes.month.createNewMonth(router, {
      createNewMonthUsecase: dependencies.createNewMonthUsecase,
      deserializer: dependencies.monthCreationDeserializer,
    })
  );
  api.use(
    routes.monthlyTemplate.addMonthlyOutflow(router, {
      usecase: dependencies.addMonthlyOutflowUsecase,
      deserializer: dependencies.addMonthlyOutflowDeserializer,
    })
  );
  api.use(
    routes.monthlyTemplate.addMonthlyBudget(router, {
      usecase: dependencies.addMonthlyBudgetUsecase,
      deserializer: dependencies.addMonthlyBudgetDeserializer,
    })
  );
  api.use(
    routes.month.transferBalanceIntoMonth(router, {
      transferBalanceIntoMonthUsecase:
        dependencies.transferBalanceIntoMonthUsecase,
      deserializer: dependencies.transferBalanceIntoMonthDeserializer,
      monthDto: dependencies.monthDto,
    })
  );
  api.use(
    routes.yearlySaving.getYearlyOutflows(router, {
      getYearlyOutflows: dependencies.getYearlyOutflowsUsecase,
      yearlyOutflowsDto: dependencies.yearlyOutflowsDto,
    })
  );
  api.use(
    routes.yearlySaving.addYearlyOutflow(router, {
      addYearlyOutflow: dependencies.addYearlyOutflowUsecase,
      deserializer: dependencies.addYearlyOutflowDeserializer,
      yearlyOutflowsDto: dependencies.yearlyOutflowsDto,
    })
  );
  api.use(
    routes.yearlySaving.removeYearlyOutflow(router, {
      removeYearlyOutflow: dependencies.removeYearlyOutflowUsecase,
      deserializer: dependencies.removeYearlyOutflowDeserializer,
      yearlyOutflowsDto: dependencies.yearlyOutflowsDto,
    })
  );
  api.use(
    routes.project.getAllProjectsByCategory(router, {
      usecase: dependencies.getAllProjectsByCategoryUsecase,
      dto: dependencies.projectDto,
    })
  );
  api.use(
    routes.project.addAmountProject(router, {
      usecase: dependencies.addAmountProjectUsecase,
      dto: dependencies.projectDto,
    })
  );
  api.use(
    routes.project.createProject(router, {
      usecase: dependencies.createProjectUsecase,
      dto: dependencies.projectDto,
    })
  );
  api.use(
    routes.project.getProject(router, {
      usecase: dependencies.getProjectUsecase,
      dto: dependencies.projectDto,
    })
  );
  api.use(
    routes.project.reApplyProject(router, {
      usecase: dependencies.reApplyProjectUsecase,
      dto: dependencies.projectDto,
    })
  );
  api.use(
    routes.project.rollbackProject(router, {
      usecase: dependencies.rollbackProjectUsecase,
      dto: dependencies.projectDto,
    })
  );
  api.use(
    routes.project.removeProject(router, {
      usecase: dependencies.removeProjectUsecase,
    })
  );
  api.use(
    routes.project.updateProject(router, {
      usecase: dependencies.updateProjectUsecase,
      dto: dependencies.projectDto,
    })
  );

  /** @deprecated */
  api.use(
    routes.month.updateExpense(router, {
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
