function fetchRepositories() {
    let username = document.getElementById("githubUsername").value;
    let repoList = document.getElementById("repoList");

    repoList.innerHTML = "Loading...";

    fetch(`https://api.github.com/users/${username}/repos`)
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