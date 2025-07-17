export function calculateBarColors({
  activity,
  available,
}: {
  activity: number;
  available: number;
}) {
  let green = 0;
  let lightGreen = 0;
  let red = 0;

  if (available === 0) {
    if (activity < 0) {
      lightGreen = 100;
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
  };
}
