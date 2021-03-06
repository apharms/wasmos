import {
  loader,
  ASImport,
  Host,
  Env as _Env
} from "@wasmos/assemblyscript/src/index";

import { fs } from "@wasmos/fs/src";
import * as path from "path";

enum ExitStatus {
  Finished = 0,
  Crashed = -1
}

export class Env extends _Env {
  PATH: string[] = ["/bin"];
  map: Map<string, string> = new Map<string, string>();
  static default: Env = Env.fromMap([["PATH", "/usr/bin"]]);

  set(name: string, value: string): Env {
    this.map.set(name, value);
    return this;
  }

  async search(arg: string): Promise<string | null> {
    for (let p of this.PATH) {
      let bin = path.join(p, arg);
      if (await fs.pathExists(bin)) {
        return bin;
      }
    }
    return null;
  }

  static fromMap(map: Map<string, string> | Iterable<readonly [string, string]>): Env {
    let env = new Env();
    env.map = (map instanceof Map) ? map : new Map(map);
    return env;
  }
}

export class Process {
  stdout = Array<string>();
  status: ExitStatus;
  host: Host;
  binName: string;
  binpath: string;

  constructor(public args: string[], public env: Env = new Env()) {
    this.binName = args[0];
  }

  async searchPath(name: string): Promise<string> {
    let binary = path.join(name, "index.wasm");
    let asc = path.join(name, "index.ts");
    if (await this.env.search(binary)) {
      return binary;
    } else if (await fs.pathExists(asc)) {
      return asc;
    }
    return null;
  }

  static async spawn(args: string[], env: Env) {}
}
