async function statementsNumber(qid) {
    try {
        const response = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${qid}.jsonld`);
        const data = await response.json();
        const jsonld = data["@graph"].find(obj => obj.statements !== undefined);
        return jsonld ? jsonld.statements : null;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
}

async function assignStatementNumber(qid) {
    const statementCount = await statementsNumber(qid);  // Await the async function
    return statementCount;
}

function check() {
    // Extract substring from the URL
    const url = window.location.href;
    const match = url.match(/\/item\/([^?]+)/);


    if (match && match[1]) {
        const substring = match[1];

        // Construct the Cirrus Search API URL
        const apiUrl = `https://www.wikidata.org/w/api.php?action=query&list=search&srsearch=haswbstatement:P4948=${substring}&format=json&origin=*`;

        // Fetch data from the API
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                // Find the target element using the XPath expression
                const xpath = '//*[@id="item-title"]';
                const itemTitleElement = document.evaluate(
                    xpath,
                    document,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null
                ).singleNodeValue;


                if (data.query && data.query.search.length > 0) {
                    const results = data.query.search;

                    // Get the first result (QID)

                    /* TODO
                    später ein Array daraus machen, um mehrere QIDs anzeigen zu können
                    */
                    const qid = results[0].title;
                    const wikidataUrl = `https://www.wikidata.org/wiki/${qid}`;

                    if (itemTitleElement) {
                        // Create the <sup> element
                        const sup = document.createElement("sup");
                        sup.classList.add("wdsup");

                        // Create a link element
                        const link = document.createElement("a");
                        link.href = wikidataUrl;
                        link.target = "_blank";
                        link.classList.add("wdsup");
                        assignStatementNumber(qid).then(numberOfStatements => {
                            // Create the text node for the first part
                            const textNode = document.createTextNode(`(${qid} - ${numberOfStatements} statements) `);
                            link.appendChild(textNode);
                            // Create the infolink <a> element
                            const infolink = document.createElement("a");
                            infolink.href = "https://www.wikidata.org/wiki/User:Awinkler3/DDB_und_Wikidata";
                            infolink.title = "Mehr Infos zu DDB und Wikidata";
                            infolink.classList.add("wdsup");
                            const infoLinkText = document.createTextNode("ⓘ");
                            infolink.appendChild(infoLinkText);  // Set the link text

                            // Append the link to the target element
                            sup.appendChild(link)
                            // Append the <a> element to the <sup> element
                            sup.appendChild(infolink);
                            itemTitleElement.appendChild(sup);
                        });



                    } else {
                        console.error("Target element not found.");
                    }
                } else {
                    // If theres no Wikidata item with the relevant DDB ID
                    if (itemTitleElement) {
                        // Create the <sup> element
                        const sup = document.createElement("sup");
                        sup.classList.add("wdsup");

                        // Create a link element
                        const link = document.createElement("a");
                        const textNode = document.createTextNode("🔍 Wikidata");
                        link.href = `https://www.wikidata.org/w/index.php?search=${itemTitleElement.innerHTML.trim()}&ns0=1`;
                        link.appendChild(textNode);
                        link.target = "_blank"; // Open in a new tab
                        link.style.marginLeft = "10px"; // Optional styling
                        link.classList.add("wdsup");

                        sup.appendChild(link)

                        // Append the link to the target element
                        itemTitleElement.appendChild(sup);
                    }
                }
            })
            .catch(error => console.error("Error fetching data:", error));
    } else {
        console.error('Invalid URL: "/item/" not found');
    }
}

check();