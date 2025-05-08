{ mkShell, pkgs, ... }:
mkShell {
  packages = with pkgs; [
    pulumi
    pulumictl
    pulumi-esc
    pulumiPackages.pulumi-command
    pulumiPackages.pulumi-aws-native
    pulumiPackages.pulumi-language-nodejs
  ];
}
