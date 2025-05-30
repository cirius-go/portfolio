import * as pulumi from "@pulumi/pulumi";
import * as infra from "./infra";
import { CreateSingleAppParams } from "./infra/monorepo";

const config = new pulumi.Config();

// DeploymentConfig contains all required configuration.
export type DeploymentConfig = {
  region: string;
  builtDir: string;
  repos: Omit<CreateSingleAppParams, "region" | "builtDir">[];
};

const cfg =
  config.requireObject<DeploymentConfig>("deployment");

console.log(cfg)

const creationParams: CreateSingleAppParams[] = cfg.repos.map(c => ({
  ...c,
  region: cfg.region,
  builtDir: cfg.builtDir,
}));

export const output = infra.monorepo.createApps(creationParams);
