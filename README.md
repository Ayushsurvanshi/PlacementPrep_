# PlacementPrep

This is a Next.js application built to be your ultimate toolkit for landing a dream job in the tech industry. It includes an AI-powered Career Guide, a Project Builder with personalized roadmaps, and a Prep Hub for practicing coding questions and mock interviews.

## Pushing to a New GitHub Repository

To get your project into a clean GitHub repository with a fresh commit history, you should first **delete the old repository on GitHub and create a new, empty one**. Then, follow these steps in your project's terminal.

### Step 1: Remove the Old Git History

First, you need to delete the existing `.git` folder. This will remove all the old, messy commit history.

```bash
rm -rf .git
```

### Step 2: Create a New, Clean Git Repository

Now, create a fresh repository with a single, clean commit.

1.  **Initialize a new Git repository:**
    ```bash
    git init -b main
    ```

2.  **Add all files to staging:**
    ```bash
    git add .
    ```

3.  **Create your first clean commit:**
    ```bash
    git commit -m "Initial commit of PlacementPrep application"
    ```

### Step 3: Push to Your New GitHub Repository

Finally, connect to your new GitHub repository and push your code.

1.  **Set the remote origin to your new repository's URL.** Make sure you use the correct URL.
    ```bash
    git remote add origin https://github.com/Ayushsurvanshi/PlacementPrep_.git
    ```

2.  **Push your code to GitHub:**
    ```bash
    git push -u origin main
    ```

After following these steps, your new GitHub repository will contain only the latest version of your code with a single, clean "Initial commit" message.
