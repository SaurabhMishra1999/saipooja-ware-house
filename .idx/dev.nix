{ pkgs, ... }: {
  channel = "unstable";

  # Add packages for your development environment
  packages = [
    pkgs.nodejs_22
    # firebase-tools is required for deploying backend functions
    pkgs.firebase-tools
  ];

  idx.extensions = [
    "dbaeumer.vscode-eslint"
  ];

  idx.workspace = {
    onCreate = {
      npm-install = "npm install";
    };
  };

  idx.previews = {
    enable = true;
    previews = {
      web = {
        command = ["npm" "run" "dev" "--" "-p" "$PORT"];
        manager = "web";
      };
    };
  };
}
