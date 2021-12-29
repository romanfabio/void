import { RepoType } from "../data/repositories/repo";
import AppConfig from "../config/config";
import { PexManager } from "./pex";

type Context = {
    env: AppConfig;
    repos: RepoType;
    pex: PexManager;
}

export default Context;