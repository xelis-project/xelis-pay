import esbuild from 'esbuild'
import path from 'path'
import { spawn } from 'child_process'

const buildClient = async () => {
  const ctx = await esbuild.context({
    entryPoints: ['./client/index.js'],
    bundle: true,
    outfile: './public/build/bundle.js',
    loader: {
      '.js': 'jsx',
      '.woff': 'dataurl',
      '.woff2': 'dataurl'
    },
    alias: {
      'react': path.resolve('./node_modules/react') // fix because we are using react in the other web-plugin project https://blog.maximeheckel.com/posts/duplicate-dependencies-npm-link/
    },
    sourcemap: `inline`
  })

  await ctx.watch()
}

const startServer = async () => {
  const process = spawn(`node`, [`./server/index.js`])

  process.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`)
  })

  process.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`)
  })

  process.on('close', (code) => {
    console.log(`child process exited with code ${code}`)
  })

  console.log(`Server started with PID: ${process.pid}`)
  return process
}

buildClient()
startServer()
