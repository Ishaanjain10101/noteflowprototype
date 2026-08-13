const title = document.getElementById("title");
const content = document.querySelector("#content");

title.disabled = true;
content.disabled = true;

document.addEventListener('selectstart', function(e) {
    e.preventDefault();
});