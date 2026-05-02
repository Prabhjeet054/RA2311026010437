export type Stack = "backend" | "frontend";
export type Level = "debug" | "info" | "warn" | "error" | "fatal";
type BackendPackage = "cache" | "controller" | "cron_job" | "db" | "domain" | "handler" | "repository" | "route" | "service";
type FrontendPackage = "api" | "component" | "hook" | "page" | "state" | "style";
type SharedPackage = "auth" | "config" | "middleware" | "utils";
/** Union of every valid package name for any stack. */
export type Package = BackendPackage | FrontendPackage | SharedPackage;
type BackendOrShared = BackendPackage | SharedPackage;
type FrontendOrShared = FrontendPackage | SharedPackage;
export declare function Log(stack: "backend", level: Level, pkg: BackendOrShared, message: string, token: string): Promise<void>;
export declare function Log(stack: "frontend", level: Level, pkg: FrontendOrShared, message: string, token: string): Promise<void>;
export {};
//# sourceMappingURL=index.d.ts.map