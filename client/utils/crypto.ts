import NodeRSA from "node-rsa";
import { Context } from "../context/context";

const context = new Context();

export function encrypt(data: string, keyString: string) {
  const key = new NodeRSA(keyString);
  return key.encrypt(data, "base64");
}

export function decrypt(data: string) {
  const key = new NodeRSA(context.getPrivateKey());
  return key.decrypt(data, "utf8");
}

export function generateKeypair() {
  const key = new NodeRSA({ b: 512 });
  return {
    privateKey: key.exportKey("private"),
    publicKey: key.exportKey("public"),
  };
}

export function encode(data: string) {
  const buf = Buffer.from(data, "ascii");
  return "0x" + buf.toString("hex");
}

export function decode(data: string) {
  const buf = Buffer.from(data.slice(2), "hex");
  return buf.toString("ascii");
}