#!/usr/bin/env node

import { Command } from 'commander';
import { getIcon, initProject, listApps, showLogs } from '../src/cli.js';

const program = new Command();
program.name('icons-ai').description('get any icon just by description').version('1.0.0');

program
  .command('get <description>')
  .description('get any icon just by description')
  .action(getIcon);

program
  .command('init')
  .description('init the project')
  .action(initProject);

program
  .command('list')
  .description('List all running apps')
  .action(listApps);

program
  .command('logs <appName>')
  .description('Tail the logs of the app')
  .action(showLogs);

program.parse();
