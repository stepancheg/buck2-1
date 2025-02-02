/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under both the MIT license found in the
 * LICENSE-MIT file in the root directory of this source tree and the Apache
 * License, Version 2.0 found in the LICENSE-APACHE file in the root directory
 * of this source tree.
 */

/**
  * The sidebars for buck2 documentation work slightly differently than normal.
  * Normally when globbing you don't have control over any ordering (in an easy to manage way)
  * Instead, we do some processing on the manualSidebar array to remove any manually specified
  * files from the autogenerated glob, and keep the manuallly specified ones in order.
  *
  * - To specify manual ordering, just put the filename into the list of items.
  * - New sections should be in a subdirectory, and should generally end have an autogenerated
  *   item as their last item.
  * - Directories that should be excluded from sidebars should be added to the
  *   'universallyExcludedDirs' set below
  *
  * If you're curious how this works, look at `generateSidebarExclusions` and
  * `filterItems` in this module, and `sidebarItemsGenerator` in docusaurus.config.js. Note
  * that `sidebarItemsGenerator` runs for each "autogenerated" item, so that's why we
  * keep track of all globs that have been specified. We need to make sure that only things
  * in "developers/" are included in the developers glob, e.g.
  */

const { isInternal } = require("docusaurus-plugin-internaldocs-fb/internal");

const universallyExcludedDirs = new Set([
  "rfcs/",
  "legacy/",
]);

const manualSidebar = [
    'index',
  {
    type: 'category',
    label: 'About Buck2',
    items: [
      'why',
      'getting_started',
      {
        type: 'category',
        label: 'Benefits',
        items: [
          'benefits',
          isInternal() ? 'testimonials' : [],
        ],
      },
    ],
  },
  {
    type: 'category',
    label: 'Concepts',
    items: [
      'concepts/build_rule',
      'concepts/build_file',
      'concepts/build_target',
      'concepts/build_target_pattern',
      'concepts/build_target_universe',
      'concepts/buck_daemon',
      'concepts/visibility',
    ],
  },
  {
    type: 'category',
    label: 'Buck2 Users',
    items: [
      isInternal() ? 'migration_guide' : [],
      {
        type: 'category',
        label: 'Commands',
        items: [
          'filler', /* can be deleted later */
          /* Autogenerated commands docs - 1 command per page */
        ],
      },
      isInternal() ? {
        type: 'category',
        label: 'Troubleshooting',
        items: [
          'faq/getting_help',
          'faq/common_issues',
          'faq/remote_execution',
        ],
      } : [],
      {
        type: 'category',
        label: 'Prelude Rules API',
        link: {
          type: 'generated-index',
          title: 'Prelude Rules API',
          description: 'API documentation for prelude.bzl',
          slug: '/generated/starlark/prelude',
        },
        items: [
          'generated/starlark/prelude/prelude.bzl',
          { type: 'autogenerated', dirName: 'generated/starlark' },
        ],
      },
    ],
  },
  {
    type: 'category',
    label: 'Rule Authors',
    items: [
      'rule_authors/writing_rules',
      {
        type: 'category',
        label: 'Rule APIs',
        items: [
          'rule_authors/rule_api',
          {
            type: 'category',
            label: 'API Docs',
            items: [{ type: 'autogenerated', dirName: 'generated/native' }],
          },
        ],
      },
      'rule_authors/transitive_sets',
      'rule_authors/configurations',
      'rule_authors/configuration_transitions',
      'rule_authors/dynamic_dependencies',
      'rule_authors/anon_targets',
      'rule_authors/test_execution',
      'rule_authors/optimization',
      isInternal() ? 'rule_authors/rule_writing_tips' : [],
      'rule_authors/incremental_actions',
      { type: 'autogenerated', dirName: 'rule_authors' },
    ],
  },
  {
    type: 'category',
    label: 'BXL Developers',
    items: isInternal() ? [
      {
        type: 'category',
        label: 'About BXL',
        items: [
          'developers/bxl',
          'developers/bxl_testimonials',
        ],
      },
      {
        type: 'category',
        label: 'User Guide',
        items: [
          'developers/bxl_getting_started',
          'developers/bxl_how_tos',
          'developers/bxl_gotchas',
        ],
      },
      'developers/bxl_faqs',
      {
        type: 'category',
        label: 'API Docs',
        items: [
          { type: 'autogenerated', dirName: 'generated/bxl' },
        ],
      },
    ] : [],
  },
  {
    type: 'category',
    label: 'Build Observability',
    items: [
      isInternal() ? 'developers/observability' : [],
      'build_observability/datasets',
    ],
  },
  {
    type: 'category',
    label: 'Buck2 Developers',
    items: [
      {
        type: 'category',
        label: 'Architecture',
        items: [
           'developers/architecture/buck2',
           isInternal() ? 'developers/architecture/buck2_telemetry' : [],
           'developers/architecture/buck1_vs_buck2',
        ],
      },
      isInternal() ? 'developers/developers' : [],
      isInternal() ? 'developers/heap_profiling' : [],
      'developers/parity_script',
      'developers/what-ran',
      {
        type: 'category',
        label: 'Starlark Language',
        items: [
          { type: 'autogenerated', dirName: 'generated/starlark_rust_docs' },
          'developers/starlark_language_spec',
          'developers/starlark_rust',
        ],
      },
    ],
  },
]

function generateSidebarExclusions(items) {
  let excludedDirs = new Set();
  let excludedFiles = new Set();

  for (const item of items) {
    if (item["type"] === "category") {
      const [newExcludedDirs, newExcludedFiles] = generateSidebarExclusions(item.items);
      excludedDirs = new Set([...excludedDirs, ...newExcludedDirs]);
      excludedFiles = new Set([...excludedFiles, ...newExcludedFiles]);
    } else if (item["type"] === "autogenerated") {
      excludedDirs.add(item.dirName + "/");
    } else if (Array.isArray(item)) {
      const [newExcludedDirs, newExcludedFiles] = generateSidebarExclusions(item);
      excludedDirs = new Set([...excludedDirs, ...newExcludedDirs]);
      excludedFiles = new Set([...excludedFiles, ...newExcludedFiles]);
    } else {
      excludedFiles.add(item)
    }
  }

  return [excludedDirs, excludedFiles];
}

const [mainExcludedDirs, mainExcludedFiles] = generateSidebarExclusions(manualSidebar);

function itemFilter(item, docs) {
  const dirName = item.dirName + '/';
  return docs.filter((doc) => {
    if (!isInternal() && doc.source.endsWith(".fb.md")) {
      return false;
    }
    if (item.dirName != '.' && !doc.id.startsWith(dirName)) {
      return false;
    }
    if (mainExcludedFiles.has(doc.id)) {
      return false;
    }
    for (dir of universallyExcludedDirs) {
      if (doc.id.startsWith(dir)) {
        return false;
      }
    }
    for (dir of mainExcludedDirs) {
      if (dirName != dir && doc.id.startsWith(dir)) {
        return false;
      }
    }
    return true;
  });
}

module.exports = {
  itemFilter: itemFilter,
  manualSidebar: manualSidebar,
};
