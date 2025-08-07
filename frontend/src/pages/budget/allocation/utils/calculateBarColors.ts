const spentMessages = ["Fully Spent", "Overspent.", "Spent"] as const;
type SpentMessage = (typeof spentMessages)[number];

type messageType = {
  important: SpentMessage;
  text: string;
};

export function calculateBarColors({
  activity,
  available,
  assigned,
}: {
  activity: number;
  available: number;
  assigned: number;
}) {
  let green = 0;
  let lightGreen = 0;
  let red = 0;
  let message = {} as messageType;

  if (available === 0) {
    if (activity < 0) {
      lightGreen = 100;
      message.important = "Fully Spent";
    }
  }
  if (available > 0) {
    if (activity === 0) {
      green = 100;
    }

    if (activity < 0) {
      const spent = -activity;
      const total = available + spent;
      green = (available / total) * 100;
      lightGreen = (spent / total) * 100;
      message.important = "Spent";
      message.text = `£${spent.toFixed(2)} of £${assigned.toFixed(2)}`;
    }

    if (activity >= available) {
      green = 0;
    }

    if (activity < available && activity > 0) {
      green = 100;
    }
  }

  if (available < 0) {
    if (activity < 0) {
      red = (-available / -activity) * 100;
      lightGreen = 100 - red;
      message.important = "Overspent.";
      message.text = `£${-activity.toFixed(2)} of £${(available - activity).toFixed(2)}`;
    }
    if (activity === available) {
      red = 100;
      lightGreen = 0;
    }
  }

  return {
    green: Math.round(green),
    lightGreen: Math.round(lightGreen),
    red: Math.round(red),
    message,
  };
}
