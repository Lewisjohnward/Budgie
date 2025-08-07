interface ReadyToAssignStatus {
  bg: string;
  message: string;
  showIcon: boolean;
}

const READY_TO_ASSIGN_STATES = {
  READY: { bg: "bg-lime-300", message: "Ready to Assign", showIcon: false },
  OVERSPENT: { bg: "bg-red-200", message: "You assigned more than you have", showIcon: false },
  COMPLETE: { bg: "bg-gray-200", message: "All money assigned", showIcon: true }
} as const;

export function generateReadyToAssignStatus(amount: number): ReadyToAssignStatus {
  if (amount > 0) {
    return READY_TO_ASSIGN_STATES.READY;
  }
  
  if (amount < 0) {
    return READY_TO_ASSIGN_STATES.OVERSPENT;
  }
  
  return READY_TO_ASSIGN_STATES.COMPLETE;
}
