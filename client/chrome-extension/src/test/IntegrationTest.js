/* eslint-disable no-unused-expressions one-var no-new, one-var-declaration-per-line */

import { expect } from 'chai';
import { JSDOM } from 'jsdom';
import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

import Client from '../client/Client';

const repositoryRoot = '../../';
const serverDir = 'fjord';
const serverPath = path.resolve(repositoryRoot + serverDir);

const serverStartupMsg = 'Running FjordWeb.Endpoint';

// the phoenix Socket library requires a global 'window' object
global.window = new JSDOM().window;

describe('integration between server and client', () => {
  describe('environment setup', () => {
    describe('server location in repository', () => {
      it('is where it is expected by client testing code', () => {
        expect(fs.existsSync(serverPath)).to.be.true;
      });
    });
    describe('elixir', () => {
      it('is installed', () => {
        expect(execSync('which elixir').toString()).to.not.be.empty;
      });
    });
    describe('mix', () => {
      it('is installed', () => {
        expect(execSync('which mix').toString()).to.not.be.empty;
      });
    });
  });

  describe('the client', function () {
    this.timeout(20000);
    let serverProcess;
    beforeEach(async () => {
      const cmd = 'mix';
      const args = ['phx.server'];
      console.debug(`spawning server process with cmd: ${cmd} ${args.join(' ')}`);
      serverProcess = spawn(cmd, args, { cwd: serverPath });
      console.debug('server process spawned');
      await new Promise((resolve) => {
        serverProcess.stdout.on('data', (data) => {
          console.debug(`SERVER STDOUT: ${data}`);
          if (data.includes(serverStartupMsg)) {
            console.debug(`server started up successfully with stdout msg: ${data}`);
            resolve();
          }
        });
        serverProcess.stderr.on('data', (data) => console.log(`SERVER STDERR: ${data}`));
        serverProcess.on('close', (code) => {
          throw new Error(`SERVER process closed with code ${code}`);
        });
      });
    });
    afterEach(() => {
      if (serverProcess) {
        console.debug('killing serverProcess');
        serverProcess.kill();
        console.debug('killed serverProcess');
      }
    });
    it('can make a connection', async () => {
      const client = new Client('ws://localhost:4000/socket', 'user');
      await new Promise((resolve, reject) => {
        client.connect(resolve, reject);
      });
    });
  });
});