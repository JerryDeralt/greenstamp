//used by .html pages in policy folder

async function loadPolicy(policyTitle) {
  const container = document.getElementById("policy-container");
  const response = await fetch("json/policies.json");
  const policies = await response.json();
  const policy = policies.find(p => p.title === policyTitle);

  let html = `
    <h1>${policy.title}</h1>
    <p><i>Duration: </i>${policy.duration}</p>
    <p><i>Description: </i>${policy.description}</p>
  `;

  const applies = policy.appliesTo;
  const categories = [
    { label: "Countries", list: applies.countries },
    { label: "Documents", list: applies.documents },
    { label: "Ports", list: applies.ports }
  ];

  // leaves out empty things in const categories
  const visibleCats = categories.filter(c => Array.isArray(c.list) && c.list.length > 0);

  if (visibleCats.length > 0 || applies.transitOnly) {
    html += `<h2>Applicability</h2><ul>`;
    visibleCats.forEach(c => {
      html += `<li><strong>${c.label}:</strong> ${c.list.join(", ")}</li>`;
    });
    if (applies.transitOnly) {
      html += `<br><li><strong>Applies only if you are on international transit travelling through China.</strong></li>`;
    }
    html += `</ul>`;
  }

  html += `<h2>Sources</h2><ul>`;
  for (const link of policy.policyLinks) {
    html += `
      <li>
        <a href="${link.url}" target="_blank">${link.title}</a>
        (${link.date})
      </li>
    `;
  }
  html += `</ul>`;

  container.innerHTML = html;
}
