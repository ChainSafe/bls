import herumi from "bls-eth-wasm";
import { herumiToIBls } from "./herumi";
import { IBls } from "./interface";

export type Backing = "herumi" | "blst-native" | "blst-wasm";

let backing: Backing|undefined = undefined;
let context: IBls|undefined = undefined;

//to maintain api compatible, add all backing context to return type
export async function init(backing: Backing = "herumi"): Promise<IBls> {
  if (!context) {
    switch(backing) {
        case "herumi": {
            context = await herumiToIBls();
            backing = backing;
        } break;
        default: throw new Error(`Unsupported backing - ${backing}`)
    }
  }
  await context.init();
  return context;
}

export function destroy(): void {
    if(context) {
        context.destroy();
    }
  context = undefined;
  backing = undefined;
}

export function getContext(): IBls {
  if (!context) {
    throw new Error("BLS not initialized");
  }
  return context;
}
