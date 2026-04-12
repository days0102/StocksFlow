# StocksFlow Commit Message Guidelines

## 1. Core Principles

A well-crafted commit message is essential for future maintainability. Your commit history is the most reliable documentation of *why* changes were made.
When writing a commit, ensure it answers:

* **Why is this change necessary?** Describe the motivation (e.g., fixing a UI glitch, adding a requested feature, or refactoring for performance).
* **How does it address the issue?** Briefly outline your approach.
* **What specific areas are affected?** Mention key functions, components, or files modified so reviewers can easily trace the logic.
If your commit fixes an issue introduced by a previous commit, clearly reference it so the dependency chain is preserved.

## 2. Commit Format Rules

We follow a strict formatting standard to allow easy parsing by testing tools and to maintain a clean repository history.

### 2.1 The Summary Line

The first line of your commit message must include a tracking issue number followed by a component tag and a brief description. **The entire line must not exceed 62 characters.**

* **Issue Tracking:** Start with the issue identifier (e.g., `SF-123` or `#123`).
* **Component Tag:** A single, lowercase word indicating the affected subsystem (e.g., `pages`, `components`, `utils`, `api`, `cloud`, `styles`, `store`, `config`, `docs`).
* **Description:** A concise summary of the change.

### 2.2 The Message Body

Leave a blank line after the summary. The body should elaborate on the details of the change. **Wrap all text in the body to 70 columns.**

### 2.3 Required & Optional Tags

Place all metadata tags at the very bottom of the commit message.

* **Signed-off-by:** (Required) Confirms you have the rights to submit this code. Must be the final line of the commit.
* **Fixes:** (Optional) Useful for referencing a previous commit that is being corrected.
* **Review/Testing Tags:** (Optional) Tags like `Tested-by:`, `Reviewed-by:`, or `StocksFlow-issue:` can be added above the sign-off line to track reviews or external references.

*TODO: It is recommended to use Git hooks (e.g., via `husky` and `commitlint`) to enforce these rules automatically before pushing.*

---

## 3. Reference Examples

**Example: Feature Addition**

```text
SF-42 components: add global stock ticker banner

The home page previously lacked real-time market overviews.
This change introduces a scrolling ticker banner component that
polls the market API and handles timezone conversions off the
main UI thread to prevent rendering stutters.

Signed-off-by: Your Name <dev@stocksflow.com>
```

**Example: Bug Fix with References**

```text
SF-88 api: fix timeout during holiday schedule fetch

Cloud functions fetching schedule data were timing out under
heavy load, leading to application crashes on startup.
This commit implements a 5-second timeout with a fallback to
cached local data, ensuring the app always loads successfully.

Fixes: a2b3c4d5e6 ("SF-39 pages: redesign home page layout")
StocksFlow-issue: https://github.com/org/StocksFlow/issues/88
Signed-off-by: Your Name <dev@stocksflow.com>
```
