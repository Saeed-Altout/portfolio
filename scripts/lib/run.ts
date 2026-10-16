import { spawnSync } from "node:child_process"

/** Quotes an argument for the shell when it contains anything special. */
function quote(arg: string) {
  return /^[\w@%+=:,./-]+$/.test(arg) ? arg : `"${arg.replace(/"/g, '\\"')}"`
}

// npx is npx.cmd on Windows, which only starts through a shell. Passing one
// quoted command line (not an args array) keeps arguments intact.
function spawn(command: string, args: string[], env?: NodeJS.ProcessEnv) {
  return spawnSync([command, ...args].map(quote).join(" "), {
    shell: true,
    encoding: "utf8",
    stdio: ["inherit", "pipe", "pipe"],
    env: env ?? process.env,
  })
}

/** Runs a command, shows its output, and throws if it fails. */
export function run(
  command: string,
  args: string[],
  options: { env?: NodeJS.ProcessEnv } = {}
) {
  const result = spawn(command, args, options.env)
  process.stdout.write(result.stdout ?? "")
  process.stderr.write(result.stderr ?? "")
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} exited with ${result.status}`)
  }
}

/** Runs a command and returns its standard output. */
export function capture(command: string, args: string[]): string {
  const result = spawn(command, args)
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} exited with ${result.status}\n${result.stderr}`
    )
  }
  return result.stdout
}
