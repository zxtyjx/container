// flow-typed signature: 20e87b8d51bb8f98aaf129f4b0bdaf81
// flow-typed version: c5395b57b9/lockfile_v1.x.x/flow_>=v0.47.x

declare module "lockfile" {
  declare type Callback = (err: ?Error) => void | mixed;
  declare type LockOptions = {
    wait?: number,
    pollPeriod?: number,
    stale?: number,
    retries?: number,
    retryWait?: number
  };
  declare interface LockFileExport {
    lock(fileName: string, opts: LockOptions, cb: Callback): void,
    unlock(fileName: string, cb: Callback): void
  }
  declare module.exports: LockFileExport;
}
