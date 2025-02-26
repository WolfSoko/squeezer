import { formatFiles, installPackagesTask, readJson, Tree, writeJson } from '@nrwl/devkit';
import { SchemaForPrettierrc } from '@schemastore/prettierrc';

import { prettierPlugin, eslintPluginPrettier, prettierConfigJsonFile, prettierConfigFile } from './prettier';
import { prettierDefaultConfig } from './prettier-default-config';
import { addEsLintPlugin, addEsLintRules, isEsLintPluginPresent } from '../eslint';
import { formatWorkspaceTask, lintWorkspaceTask, addDevDependencyToPackageJson } from '../lib';

export async function prettierGenerator(tree: Tree) {
  setPrettierConfig(tree);

  if (isEsLintPluginPresent(tree, prettierPlugin)) {
    return;
  }
  addEsLintPlugin(tree, prettierPlugin, '@nrwl/nx');
  addEsLintRules(tree, {
    files: ['*.ts', '*.tsx', '*.js', '*.jsx', '*.json', '*.md', '*.html'],
    extends: ['plugin:prettier/recommended'],
    rules: {},
  });

  addDevDependencyToPackageJson(tree, eslintPluginPrettier);
  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);
    lintWorkspaceTask(tree);
    formatWorkspaceTask(tree);
  };
}

function setPrettierConfig(tree: Tree): void {
  if (tree.exists(prettierConfigJsonFile)) {
    return;
  }

  if (!tree.exists(prettierConfigFile)) {
    writeJson(tree, prettierConfigFile, {});
  }

  let prettierConfig = readJson<Exclude<SchemaForPrettierrc, string>>(tree, prettierConfigFile);
  prettierConfig = { ...prettierDefaultConfig, ...prettierConfig };

  writeJson(tree, prettierConfigFile, prettierConfig);
  tree.rename(prettierConfigFile, prettierConfigJsonFile);
}
