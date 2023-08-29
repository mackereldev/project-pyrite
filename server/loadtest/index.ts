import { cli, Options } from "@colyseus/loadtest";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function main(options: Options) {
    throw new Error("No loadtest defined.");
}

cli(main);
