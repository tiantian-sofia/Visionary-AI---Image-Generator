Git push workflow. Do the following steps in order:

1. Run `git status` to show current changes and `git branch --show-current` to display the current branch
2. Run `git add -A` to stage all changes
3. Run `git diff --cached --stat` to show what will be committed
4. Ask the user for a commit message using AskUserQuestion
5. Create the commit with the user's message
6. Push to origin on the current branch

If there are no changes to commit, inform the user and stop.
