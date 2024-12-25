import inquirer from "inquirer";

export async function getUserInput(): Promise<{ TIKTOK_USERNAME: string; PORT: string; }> {
  return inquirer.prompt([
    {
      name: "TIKTOK_USERNAME",
      type: "input",
      message: "Enter TikTok username (must be live):",
      validate: function (value) {
        if (value.trim()) return true;
        return "Please enter a valid TikTok username.";
      },
    },
    {
      name: "PORT",
      type: "input",
      message: "Enter the port number:",
      default: "3000",
      validate: function (value) {
        const valid = !isNaN(parseInt(value));
        return valid || "Please enter a valid number for the port.";
      },
    },
  ]);
}
