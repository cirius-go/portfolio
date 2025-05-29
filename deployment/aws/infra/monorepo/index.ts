import * as pulumi from "@pulumi/pulumi";
import * as core from "../../core";

export type CreateSingleAppParams = {
  name: string;
  region: string;
  builtDir: string;
  s3: {
    toSyncFolder: string;
  },
  cfDistribution: {
    priceClass: string;
    acmCertArn: string;
    r53Integration?: {
      enable: boolean;
      hostedZoneId: string;
      domain: string;
      subDomain?: string;
      buildSubDomain?: string[];
    };
  },
};

export type CreateSingleAppResult = {
  cfDistribution: {
    id: pulumi.Input<string>;
    enabledR53Integration: pulumi.Input<boolean>;
    hostedZoneId: pulumi.Input<string>;
    domainName: pulumi.Input<string>;
    aliases: pulumi.Input<pulumi.Input<string>[]>;
    r53?: {
      distributionId: pulumi.Input<string>;
      recordId: pulumi.Input<string>;
      hostedZoneId: pulumi.Input<string>;
      domainName: pulumi.Input<string>;
    }
  };
  bucket: {
    name: pulumi.Input<string>;
    regionalDomainName: pulumi.Input<string>;
  }
};

export const createApps = (params: CreateSingleAppParams[]) => {
  return params.map(p => createSingleApp(p));
}

const subDomainBuilder = (appName: string, keys: string[]) => {
  return keys.map((key) => {
    let fragment = "";
    switch (key) {
      case "org":
        fragment = pulumi.getOrganization()
        break;
      case "project":
        fragment = pulumi.getProject()
        break;
      case "name":
        fragment = appName;
        break;
      case "stack":
        fragment = pulumi.getStack()
        break;
    }
    if (fragment === "") {
      throw new Error(`Required "${key}" is empty when building sub domain`)
    }
    return fragment
  }).join("-")
}

export const createSingleApp = (params: CreateSingleAppParams): CreateSingleAppResult => {
  const s3Res = core.s3.setupBucketWithSyncFolder({
    toSyncFolder: params.s3.toSyncFolder,
    name: params.name,
    builtDir: params.builtDir,
  });

  const cfAliases: string[] = [];
  const { r53Integration: cfR53Integration } = params.cfDistribution;
  let r53DomainName: string | undefined
  if (cfR53Integration?.enable) {
    let { subDomain, domain, buildSubDomain } = cfR53Integration;
    if (typeof buildSubDomain !== "undefined" && buildSubDomain.length > 0) {
      subDomain = subDomainBuilder(params.name, buildSubDomain);
    }
    r53DomainName = subDomain ? `${subDomain}.${domain}` : domain;
    cfAliases.push(r53DomainName);
  }

  const { bucket } = s3Res;
  const cfDistRes = core.cf.createDistributionWithS3({
    name: params.name,
    bucket: {
      id: bucket.id,
      bucket: bucket.bucket,
      arn: bucket.arn,
      bucketRegionalDomainName: bucket.bucketRegionalDomainName,
    },
    priceClass: params.cfDistribution.priceClass,
    acmCertArn: params.cfDistribution.acmCertArn,
    aliases: cfAliases,
  });

  const res: CreateSingleAppResult = {
    cfDistribution: {
      id: cfDistRes.distribution.id,
      enabledR53Integration: params.cfDistribution.r53Integration?.enable || false,
      hostedZoneId: cfDistRes.distribution.hostedZoneId,
      domainName: cfDistRes.distribution.domainName,
      aliases: cfAliases,
    },
    bucket: {
      name: bucket.bucket,
      regionalDomainName: bucket.bucketRegionalDomainName
    }
  };

  if (cfR53Integration?.enable) {
    const { hostedZoneId } = cfR53Integration;
    const r53RecRes = core.r53.createRecordWithCFDistribution({
      name: params.name,
      hostedZoneId: hostedZoneId,
      domain: r53DomainName || "",
      distribution: {
        domainName: cfDistRes.distribution.domainName,
        hostedZoneId: cfDistRes.distribution.hostedZoneId,
      }
    });

    res.cfDistribution.r53 = {
      distributionId: cfDistRes.distribution.id,
      recordId: r53RecRes.id,
      hostedZoneId: hostedZoneId,
      domainName: r53DomainName || ""
    };

    pulumi.all([cfDistRes.distribution.id, s3Res.toSyncFolder]).apply(async ([dId]) => {
      await core.cf.createInvalidateCache(dId, params.region);
    });
  }

  return res;
};
