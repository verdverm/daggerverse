/**
 * A generated module for Chad functions
 *
 * This module has been generated via dagger init and serves as a reference to
 * basic module structure as you get started with Dagger.
 *
 * Two functions have been pre-created. You can modify, delete, or add to them,
 * as needed. They demonstrate usage of arguments and return types using simple
 * echo and grep commands. The functions can be called from the dagger CLI or
 * from one of the SDKs.
 *
 * The first line in this comment block is a short description line and the
 * rest is a long description with more detail on the module's purpose or usage,
 * if appropriate. All modules should have a short description.
 */

import { dag, Container, Directory, object, func } from "@dagger.io/dagger"

import cfg from './config';

import { deployerImage } from "./images";

@object()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Chad {
  /**
   * Returns a container that echoes whatever string argument is provided
   */
  @func()
  async echo(msg: string): Promise<string> {
    return dag.container()
      .from("alpine:latest")
      .withExec(["echo", msg])
      .stdout()
  }

  @func()
  async gcloud(): Promise<string> {
    return dag.container()
      .from(cfg.gcloudVersion)
      .withExec(["bash", "-c", "gcloud version"])
      .stdout()
  }

  @func()
  async versions(): Promise<string> {
    const script = `
    echo "GCLOUD"
    gcloud version
    echo "\n"

    echo "CUE"
    cue version
    echo "\n"

    echo "HELM"
    helm version
    echo "\n"

    echo "cuelm"
    echo "${cfg.cuelmVersion}"
    echo "\n"

    `
    return dag.container()
      .from(cfg.gcloudVersion)
      .withExec(["bash", "-c", ""])
      .stdout()
  }

  /**
   * TODO, add init to write out cue.mod contents?
   */
  @func()
  init(stringArg: string): Container {
    return dag.container()
      .from("alpine:latest")
      .withExec(["echo", stringArg])
  }

  /**
   * Returns lines that match a pattern in the files of the provided Directory
   */
  @func()
  async view(dir: Directory): Promise<string> {
    const d = await deployerImage()
    return d
      .withMountedDirectory("/work", dir)
      .withWorkdir("/work")
      .withExec(["cue", "eval", "."])
      .stdout()
  }
}
