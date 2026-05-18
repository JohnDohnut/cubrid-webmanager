let resolveSetup: (() => void) | null = null;
let setupCompleted = false;

export function resetWorkspaceSetupGate(): void {
  setupCompleted = false;
  resolveSetup = null;
}

export function waitForWorkspaceSetupComplete(): Promise<void> {
  return new Promise((resolve) => {
    resolveSetup = resolve;
  });
}

export function notifyWorkspaceSetupComplete(): void {
  setupCompleted = true;
  resolveSetup?.();
  resolveSetup = null;
}

export function wasWorkspaceSetupCompleted(): boolean {
  return setupCompleted;
}
