/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under both the MIT license found in the
 * LICENSE-MIT file in the root directory of this source tree and the Apache
 * License, Version 2.0 found in the LICENSE-APACHE file in the root directory
 * of this source tree.
 */

use gazebo::prelude::*;

/// The logging verbosity to use in our various consoles.
///
/// Each level is a superset of the previous ones.
/// Accessor methods should be used to determine
/// specific requested functionality.
#[derive(Debug, Copy, Clone, Dupe, PartialEq, Eq, PartialOrd, Ord)]
pub enum Verbosity {
    /// Print as few messages as possible.
    Quiet,
    /// The default verbosity. Error messages are printed, but extra details may not be.
    Default,
    /// Print more things, but still a manageable and potentially useful amount of output.
    Verbose,
    /// Print even more things, this is likely not very useful.
    AllCommands,
    /// Print too much output, this is likely not useful.
    AllStderr,
}

impl Verbosity {
    pub fn try_from_cli(value: &str) -> anyhow::Result<Self> {
        Ok(match value.parse::<i64>()? {
            i if i <= 0 => Self::Quiet,
            1 => Self::Default,
            2 => Self::Verbose,
            3 => Self::AllCommands,
            _ => Self::AllStderr,
        })
    }

    /// If a verbosity setting is triggered at a particular level, does this verbosity trigger it
    fn at(self, required: Verbosity) -> bool {
        self >= required
    }

    /// Whether stderr should be printed to users for successful commands by default.
    pub fn print_success_stderr(self) -> bool {
        self.at(Self::AllStderr)
    }

    /// Whether the full command for failed actions should be printed. Otherwise, a truncated command is printed.
    pub fn print_failure_full_command(self) -> bool {
        self.at(Self::Verbose)
    }

    /// Whether to print all commands that are being executed
    pub fn print_all_commands(self) -> bool {
        self.at(Self::AllCommands)
    }

    /// Whether we should show all actions (in consoles where that is relevant).
    pub fn print_all_actions(self) -> bool {
        self.at(Self::Verbose)
    }

    /// Whether we should print periodic status messages
    pub fn print_status(self) -> bool {
        self.at(Self::Default)
    }

    /// Whether we should print I/O stats and so on when outputting status of what we're waiting
    /// on. Note that we'll still print them if we hit a condition where we think they are
    /// relevant, such as zero open spans.
    pub fn always_print_stats_in_status(self) -> bool {
        self.at(Self::Verbose)
    }
}
