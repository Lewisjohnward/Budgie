import type { Reporter, Task } from "vitest";

function flattenTasks(tasks: Task[], parentSuite = "") {
  const results: { type: "suite" | "test"; name: string; state: string }[] = [];

  for (const task of tasks) {
    const fullName = parentSuite ? `${parentSuite} > ${task.name}` : task.name;

    if (task.type === "suite") {
      // Determine suite state based on child tasks
      const childResults = task.tasks ? flattenTasks(task.tasks, fullName) : [];
      const suiteState = childResults.some((t) => t.state === "fail")
        ? "fail"
        : childResults.every((t) => t.state === "skipped")
          ? "skipped"
          : "pass";
      results.push({ type: "suite", name: fullName, state: suiteState });
      results.push(...childResults);
    } else if (task.type === "test") {
      results.push({
        type: "test",
        name: fullName,
        state: task.result?.state ?? "unknown",
      });
    }
  }

  return results;
}

export default class SummaryReporter implements Reporter {
  onFinished(files: Task[]) {
    const all = flattenTasks(files);

    const passed = all.filter((t) => t.state === "pass");
    const failed = all.filter((t) => t.state === "fail");
    const skipped = all.filter((t) => t.state === "skipped");

    if (passed.length) {
      console.log("\n✅ Passed:");
      passed.forEach((t) => console.log(`- ${t.name}`));
    }

    if (failed.length) {
      console.log("\n❌ Failed:");
      failed.forEach((t) => console.log(`- ${t.name}`));
    }

    if (skipped.length) {
      console.log("\n⏭ Skipped:");
      skipped.forEach((t) => console.log(`- ${t.name}`));
    }
  }
}
