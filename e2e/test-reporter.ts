import type {
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";

const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
const red = (text: string) => `\x1b[31m${text}\x1b[0m`;
const yellow = (text: string) => `\x1b[33m${text}\x1b[0m`;
const dim = (text: string) => `\x1b[2m${text}\x1b[0m`;

type TestInfo = {
  name: string;
  duration: number;
};

export default class MyReporter implements Reporter {
  private testNumber = 0;
  private passed = 0;
  private failed = 0;
  private tests: TestInfo[] = [];
  private startTime!: number;

  onBegin(config: { workers: number }, suite: Suite) {
    this.startTime = Date.now();

    const workers = config.workers;

    console.log(
      dim(
        `Running ${suite.allTests().length} tests using ${workers} worker${workers > 1 ? "s" : ""
        }`
      )
    );

    console.log("");
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.testNumber++;

    if (result.status === "passed") {
      this.passed++;
    } else {
      this.failed++;
    }

    const file = test.location.file.split("/").pop()?.padEnd(28);
    const project = test.parent.project()?.name;

    const titles = test
      .titlePath()
      .filter(Boolean)
      .filter((title) => !title.includes("/") && !title.includes("\\"))
      .filter((title) => title !== project)
      .join(" › ");

    const durationSeconds = Math.round(result.duration / 1000);
    const durationText = `${durationSeconds}s`.padStart(4);

    const duration =
      durationSeconds >= 5 ? yellow(durationText) : dim(durationText);

    const status = result.status === "passed" ? green("✓") : red("✗");

    const number = dim(String(this.testNumber).padStart(2, "0"));
    const suite = dim(`[${project}]`.padEnd(9));

    console.log(
      `${status} ${number} ${suite} › ${file} › ${titles} ${duration}`
    );

    this.tests.push({
      name: `${file} › ${titles}`,
      duration: result.duration,
    });
  }

  onEnd(_result: FullResult) {
    const total = this.passed + this.failed;
    const durationSeconds = ((Date.now() - this.startTime) / 1000).toFixed(1);

    console.log("");

    if (this.failed === 0) {
      console.log(`${green("✓")} ${total} tests passed`);
    } else {
      console.log(`${red("✗")} ${this.failed} failed, ${this.passed} passed`);
    }

    console.log(dim(`Completed in ${durationSeconds}s`));
  }
}
