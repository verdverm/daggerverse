import util from 'util';
import { exec as origExec } from "child_process";
const exec = util.promisify(origExec);

import { dag, Client, Container, File } from "@dagger.io/dagger"

import cfg from './config'
import { addTools } from './utils'

export async function withGcloudLocalAuth(container: Container): Promise<Container> {
	const { stdout } = await exec("bash -c \"gcloud info --format='value(config. paths. global_config_dir)'\"")
	const gcfg = stdout.trim()

	const d = dag.directory(gcfg);

	return container
		.pipeline("gcloud-local-auth")
		// mount local user config, need service account in CI? or just a step to auth?
		.withEnvVariable("CLOUDSDK_CONFIG", "/gcloud/config")
		.withMountedDirectory("/gcloud/config", d)
}

export async function deployerImage(): Promise<Container> {
	var c = dag.container().from(cfg.gcloudVersion)
	c = await withGcloudLocalAuth(c)
	c = addTools(c)
	return c
}