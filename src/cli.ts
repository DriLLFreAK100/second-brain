#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { apiSearch, apiListFiles, apiHealthCheck } from './api-client.js';

interface QueryOptions {
  context: string;
}

const program = new Command();

program
  .name('brain')
  .description('🧠 Query your second brain knowledge base')
  .version('1.0.0');

program
  .command('query <searchTerm>')
  .alias('q')
  .option('-c, --context <lines>', 'Number of context lines around matches', '2')
  .description('Search for a term in your markdown files')
  .action(async (searchTerm: string, options: QueryOptions) => {
    const contextLines = parseInt(options.context, 10);

    if (isNaN(contextLines) || contextLines < 0) {
      console.error(chalk.red('Error: context lines must be a non-negative number'));
      process.exit(1);
    }

    try {
      console.log(chalk.blue.bold(`🔍 Searching for: "${searchTerm}"\n`));

      const result = await apiSearch(searchTerm, contextLines);

      if (result.resultsCount === 0) {
        console.log(chalk.yellow(`No results found for "${searchTerm}"`));
        process.exit(0);
      }

      console.log(chalk.gray(`Found ${result.resultsCount} file(s):\n`));

      result.results.forEach((fileResult) => {
        console.log(`📄 ${fileResult.file} (${fileResult.matchCount} match${fileResult.matchCount > 1 ? 'es' : ''})`);
        console.log('─'.repeat(60));

        fileResult.matches.forEach((match, index) => {
          console.log(`Line ${match.lineNumber}:`);
          console.log('```');
          console.log(match.snippet);
          console.log('```');

          if (index < fileResult.matches.length - 1) {
            console.log('');
          }
        });

        console.log('');
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`Error: ${errorMessage}`));
      console.error(chalk.yellow('\nℹ️  Make sure the server is running: npm run start'));
      process.exit(1);
    }
  });

program
  .command('list')
  .alias('ls')
  .description('List all markdown files in your knowledge base')
  .action(async () => {
    try {
      console.log(chalk.blue.bold('📚 Files in your knowledge base:\n'));

      const result = await apiListFiles();

      if (result.filesCount === 0) {
        console.log(chalk.yellow('No markdown files found.'));
        process.exit(0);
      }

      result.files.forEach((file) => {
        console.log(`  ${chalk.cyan('•')} ${file}`);
      });

      console.log(chalk.gray(`\nTotal: ${result.filesCount} file(s)`));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`Error: ${errorMessage}`));
      console.error(chalk.yellow('\nℹ️  Make sure the server is running: npm run start'));
      process.exit(1);
    }
  });

program
  .command('health')
  .description('Check if the API server is running')
  .action(async () => {
    try {
      const isHealthy = await apiHealthCheck();

      if (isHealthy) {
        console.log(chalk.green('✅ Server is running and healthy!'));
        process.exit(0);
      } else {
        console.log(chalk.red('❌ Server is not responding'));
        process.exit(1);
      }
    } catch {
      console.log(chalk.red('❌ Cannot connect to server'));
      console.error(chalk.yellow('\nℹ️  Start the server with: npm run start'));
      process.exit(1);
    }
  });

program
  .command('help', { isDefault: true })
  .description('Show help')
  .action(() => {
    program.outputHelp();
  });

// If no command provided, show help
if (process.argv.length < 3) {
  program.outputHelp();
} else {
  program.parse(process.argv);
}
