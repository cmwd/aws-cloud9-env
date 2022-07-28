import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as cloud9 from "aws-cdk-lib/aws-cloud9";

export class AwsCloud9EnvStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "VPC", {
      maxAzs: 1,
      subnetConfiguration: [
        { subnetType: ec2.SubnetType.PUBLIC, name: "cloud9-public-subnet" },
      ],
    });

    const ownerArn = this.node.tryGetContext("owner-arn");

    const cloud9Env = new cloud9.CfnEnvironmentEC2(this, "Cloud9", {
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.LARGE
      ).toString(),
      imageId: "ubuntu-18.04-x86_64",
      subnetId: vpc.selectSubnets({ subnetType: ec2.SubnetType.PUBLIC })
        .subnetIds[0],
      connectionType: "CONNECT_SSM",
      ownerArn: ownerArn,
    });

    new CfnOutput(this, "C9_IDE_URL", {
      value: `https://${this.region}.console.aws.amazon.com/cloud9/ide/${cloud9Env.ref}`,
    });

    this.tags.setTag("Application", "Cloud9 Environment");
  }
}
