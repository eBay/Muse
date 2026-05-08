# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Extension Points in This Plugin

Note that there're two helpers to define extension points in src/utils.js: `extendArray` and `extendFormMeta`. They are just helpers which doesn't expose extension points themselves. But only when they are called with arguments, the extension points are actually defined. So, this information is important when analyze this plugin or other plugins which use these helpers, don't treat plugin invoke as exposed extension points. You (Claude Code) should understand and give correct analysis about these two helpers when dealing with extension points related tasks.

