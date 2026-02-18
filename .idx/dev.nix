{ pkgs, ... }: {
  # Use the unstable channel for the latest packages
  channel = "unstable";

  # Install Node.js and Python
  packages = [
    pkgs.nodejs_22
    pkgs.python3
    pkgs.zip
  ];

  # Recommended VS Code extensions
  idx.extensions = [
    "dbaeumer.vscode-eslint"
  ];

  # Workspace lifecycle hooks
  idx.workspace = {
    # When the workspace is first created, install dependencies
    onCreate = {
      npm-install = "npm install";
    };
    # When the workspace starts, run the development server
    onStart = {
      start-server = "npm run dev";
    };
  };

  # Configure a web preview for our app
  idx.previews = {
    enable = true;
    previews = {
      web = {
        # The command to start the web server for the preview.
        # It uses the dev script from package.json and the $PORT environment variable
        command = ["npm" "run" "dev" "--" "--port" "$PORT"];
        manager = "web";
      };
    };
  };
}
