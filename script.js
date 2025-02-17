function fetchRepositories() {
    let username = document.getElementById("githubUsername").value;
    let repoList = document.getElementById("repoList");

    if (!username) {
        repoList.innerHTML = "⚠️ لطفاً یوزرنیم GitHub را وارد کنید!";
        return;
    }

    repoList.innerHTML = "⌛ در حال دریافت اطلاعات...";

    fetch(`https://api.github.com/users/${username}/repos`)
        .then(response => response.json())
        .then(data => {
            repoList.innerHTML = "";
            if (data.length === 0) {
                repoList.innerHTML = "❌ هیچ مخزنی پیدا نشد!";
                return;
            }

            data.forEach(repo => {
                let listItem = document.createElement("li");
                listItem.innerHTML = `
                    <strong>${repo.name}</strong>
                    <p>${repo.description || "بدون توضیحات"}</p>
                    <a href="${repo.html_url}" target="_blank">🔗 مشاهده در GitHub</a> |
                    <a href="https://vscode.dev/github/${username}/${repo.name}" target="_blank">📝 ویرایش در VS Code</a>
                `;
                repoList.appendChild(listItem);
            });
        })
        .catch(error => {
            repoList.innerHTML = "❌ مشکلی پیش اومده!";
            console.error(error);
        });
}