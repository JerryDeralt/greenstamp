//used in index.html

async function checkVisa() {
    const country = document.getElementById("country").value;
    const port = document.getElementById("port").value;
    const isTransit = document.getElementById("transit").checked;
    const isGroup = document.getElementById("group").checked;

    const selectedDocs = [];
        if (document.getElementById("ordinary").checked) selectedDocs.push("Ordinary Passport");
        if (document.getElementById("residence").checked) selectedDocs.push("Chinese Residence Permit");
        if (document.getElementById("apec").checked) selectedDocs.push("APEC Business Card");
        if (document.getElementById("agreement").checked) {
            if (document.getElementById("group-travel").checked) selectedDocs.push("Group Travel Document");
            if (document.getElementById("service").checked) selectedDocs.push("Service Passport");
            if (document.getElementById("special").checked) selectedDocs.push("Special Passport");
            if (document.getElementById("diplomatic").checked) selectedDocs.push("Diplomatic Passport");
            if (document.getElementById("public-affairs").checked) selectedDocs.push("Passport for Public Affairs");
            if (document.getElementById("eu").checked) selectedDocs.push("EU Laissez-Passer");
            if (document.getElementById("travel-documents").checked) selectedDocs.push("Travel Document of the PRC");
            if (document.getElementById("seamen").checked) selectedDocs.push("Seamen's Book");
        }

    let policyText = "";
    let agreementText = "";

    if (document.getElementById("policy").checked) {
        const res = await fetch("json/policies.json");
        const policies = await res.json();

        const matches = policies.filter(p =>
            (country === "" || p.appliesTo.countries.length < 1 || p.appliesTo.countries.includes(country)) &&
            (!p.appliesTo.transitOnly || isTransit) &&
            (!p.appliesTo.groupOnly || isGroup) &&
            (port === "" || p.appliesTo.ports.length < 1 || p.appliesTo.ports.includes(port)) &&
            (p.appliesTo.documents.length === 0 || selectedDocs.some(doc => p.appliesTo.documents.includes(doc)) || selectedDocs.length === 0)
        );

        if (matches.length > 0) {
            policyText += "<h3>Applicable Policies</h3><ul>";
            matches.forEach(p => {
                let durationText = p.duration;
                let daysToStay = parseInt(durationText.split(" ")[0]);
                let departureDateText = "";

                console.log(durationText, daysToStay);

                if (!isNaN(daysToStay)) {
                    const monthName = document.getElementById("month").value;
                    const day = parseInt(document.getElementById("day").value);
                    const year = parseInt(document.getElementById("year").value);
                    
                    console.log(monthName, day, year);

                    const daysInMonth = {
                        January: 31,
                        February: (year && ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0))) ? 29 : 28,
                        March: 31,
                        April: 30,
                        May: 31,
                        June: 30,
                        July: 31,
                        August: 31,
                        September: 30,
                        October: 31,
                        November: 30,
                        December: 31
                    };

                    console.log(daysInMonth)

                    const monthIndex = Object.keys(daysInMonth).indexOf(monthName);
                    if (monthIndex !== -1 && !isNaN(day) && !isNaN(year)) {
                        let date = new Date(year, monthIndex, day);
                        date.setDate(date.getDate() + daysToStay);

                        console.log(date);

                        const options = { year: "numeric", month: "long", day: "numeric" };
                        departureDateText = date.toLocaleDateString("en-US", options);

                        console.log(departureDateText);
                    }
                }

                policyText += `<li class="policy">
                    <strong><a href=${p.page}>${p.title}</a></strong><br>
                    <i>Duration</i>: ${p.duration}`;

                if (departureDateText) {
                    policyText += `; <strong class="green">departing on ${departureDateText}</strong>`;
                }

                policyText += `<br>`

                policyText += `<i>Description</i>: ${p.description}<br>
                    </li>`;
            });
            policyText += "</ul>";
        }
    }

    if (document.getElementById("agreement").checked) {
        const res = await fetch("json/agreements.json");
        const agreements = await res.json();

        const matches = agreements[country]?.filter(entry => {
            const allDocs = entry.normalizedDocuments?.length > 0
                ? entry.normalizedDocuments
                : entry.documents || [];

            const cleanDocs = allDocs.map(d => d.replace("*", ""));

            if (!selectedDocs || selectedDocs.length === 0) {
                return cleanDocs.length > 0;
            }
            return selectedDocs.some(doc => cleanDocs.includes(doc));
        }) || [];

        if (matches.length > 0) {
            const hasAsteriskDocs = matches.some(entry =>
                entry.normalizedDocuments?.some(d => d.includes("*"))
            );

            agreementText = `<h3>Applicable Agreements - ${country}</h3><ul>`;
            matches.forEach(entry => {
                const docs = entry.normalizedDocuments?.length > 0
                    ? entry.normalizedDocuments.join(", ")
                    : entry.documents.join(", ");

                agreementText += `<li class="agreement">
                    <i>Documents</i>: ${docs}<br>
                    <i>Duration</i>: ${entry.duration}<br>
                </li>`;
            });
            agreementText += "</ul>";

            if (hasAsteriskDocs) {
                agreementText += `<p class="note">
                    *Items marked with an asterisk are not verbatim translations. Please verify details using official sources:<br>
                    <a href="https://en.nia.gov.cn/n147418/n147463/c181470/content.html" target="_blank">Details of Mutual Visa Exemption Agreements</a> (2025/04/14)<br>
                    <a href="https://cs.mfa.gov.cn/zlbg/bgzl/lhqz/202506/t20250619_11653324.shtml" target="_blank"><placeholder>List of China-Foreign Mutual Visa Exemption Agreements</placeholder></a> (2025/07/15)
                </p>`;
            }
        }
    }

    document.getElementById("result").innerHTML = policyText + agreementText
}