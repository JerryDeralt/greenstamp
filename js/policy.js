//used in policy.html

async function policy() {
  const container = document.getElementById("policy-display");
  const response = await fetch("json/policies.json");
  const policies = await response.json();

  let html = "<ul>";
  for (const p of policies) {
    html += `<li><a href="${p.page}">${p.title}</a> (${p.policyLinks[0].date})</li>`;
  }
  html += `</ul>`;

  container.innerHTML = html;
}