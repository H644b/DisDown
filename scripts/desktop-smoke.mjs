import { _electron as electron } from "@playwright/test";
const executablePath = process.env.DISDOWN_EXECUTABLE;
const app = await electron.launch(
  executablePath
    ? {
        executablePath,
        args:
          process.env.CI && process.platform === "linux"
            ? ["--no-sandbox"]
            : [],
      }
    : {
        args: [
          ".",
          ...(process.env.CI && process.platform === "linux"
            ? ["--no-sandbox"]
            : []),
        ],
      },
);
try {
  const page = await app.firstWindow();
  await page.waitForLoadState("domcontentloaded");
  if (!(await page.title().then((t) => t.includes("DisDown"))))
    throw new Error("Wrong application title");
  await page.getByRole("button", { name: "Explore with sample data" }).click();
  await page.getByRole("button", { name: "Choose export options" }).waitFor();
  console.log(
    "Desktop application launched; preload and sample API are working.",
  );
} finally {
  await app.close();
}
