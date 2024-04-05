import { dag, Container, File, Directory, object, func } from "@dagger.io/dagger"

import cfg from './config'

export function addTools(c: Container): Container {
	c = addCue(c)
	c = addHelm(c)
	c = addCuelm(c)

	return c
}

export function addCue(c: Container): Container {
	const url = `https://github.com/cue-lang/cue/releases/download/${cfg.cueVersion}/cue_${cfg.cueVersion}_linux_amd64.tar.gz`
  return addBin(c, url, "cue")
}

export function addHelm(c: Container): Container {
  const url = `https://get.helm.sh/helm-${cfg.helmVersion}-linux-amd64.tar.gz`
  return addBin(c, url, "helm")
}

export function addBin(c: Container, url: string, name: string): Container {
	const targz = dag.http(url)

	const bin = untargz(targz).file(name)

	return c
		.withFile(`/usr/local/bin/${name}`, bin)
		.withExec(["chmod", "+x", `/usr/local/bin/${name}`])
}

export function addCuelm(c: Container): Container {
	const repo = dag
		.git("https://github.com/hofstadter-io/cuelm")
		.tag(cfg.cuelmVersion)
		.tree()

	return c
		.withWorkdir("/work")
		.withExec(["cue", "mod", "init", "verdverm.com/chad"])
		.withDirectory("/work/cue.mod/pkg/github.com/hofstadter-io/cuelm", repo)
}

export function untargz(targz: File) {
	return dag.container()
		.from(cfg.gcloudVersion)
		.withWorkdir("/tmp")
		.withFile("/tmp/file.tar.gz", targz)
		.withExec(["tar", "-xf", "file.tar.gz"])
		.directory("/tmp")
}