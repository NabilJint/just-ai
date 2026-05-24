import { task } from "@trigger.dev/sdk";

export const helloWorldTask = task({
  id: "hello-world",
  run: async (payload: { message?: string }) => {
    const msg = payload.message ?? "Hello from Trigger.dev!";
    console.log(msg);
    return { greeting: msg };
  },
});
