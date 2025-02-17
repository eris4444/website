const GITHUB_TOKEN = "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";  // 🔴 توکن خودتو اینجا بزار

function fetchRepositories() {
    let username = document.getElementById("githubUsername").value;
    let repoList = document.getElementById("repoList");

    repoList.innerHTML = "Loading...";

    fetch(`https://api.github.com/users/${username}/repos`, {
        headers: {
            Authorization: `token ${GITHUB_TOKEN}`
        }
    })
    .then(response => response.json())
    .then(data => {
        repoList.innerHTML = "";
        data.forEach(repo => {
            let listItem = document.createElement("li");
            listItem.innerHTML = `
                <strong>${repo.name}</strong>
                <p>${repo.description || "No description"}</p>
                <a href="${repo.html_url}" target="_blank">View on GitHub</a> |
                <a href="https://vscode.dev/github/${username}/${repo.name}" target="_blank">Open in VS Code</a>
            `;
            repoList.appendChild(listItem);
        });
    })
    .catch(error => {
        repoList.innerHTML = "Error fetching repositories!";
        console.error(error);
    });
}