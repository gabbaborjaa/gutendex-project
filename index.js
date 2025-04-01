const readline = require('readline');
const url = 'https://gutendex.com/books?search=';

async function getData(str){
    try {
        const request = await fetch(url + str);
        const json = await request.json();

        if (json.results.length === 0) {
            console.log("Sorry. No books found.");
            return;
        }

        console.log(`Search Results: (${json.count})`)
        
        // for(let i=0; i<=json.count; ++i){
        //     const book_id = json.results[i].id
        //     const title = json.results[i].title
        //     const author = json.results[i].authors[0].name
        //     console.log(`${i} ${book_id}. ${title}`)
        //     console.log(`${i} ${book_id}. ${title} by ${author}`)
        // };

        json.results.forEach((book, index) => {
            console.log(`${index + 1}. ${book.id} - ${book.title} by ${book.authors.map(author => author.name).join(', ')}`);
        });

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question("Choose a book ID: ", async (answer) => {
            const choice = parseInt(answer);
            console.log(choice);
            
            // Copilot
            const selectedBook = json.results.find(book => book.id === choice);
            if (!selectedBook) {
                console.log("Sorry. That book ID is not connected with any book.");
                rl.close();
                return;
            }
            console.log(`You selected ${selectedBook.title}`);

            const bookID = selectedBook.id;
            const bookDetails = await fetch(`https://gutendex.com/books/${bookID}`);
            const bookJson = await bookDetails.json();
            console.log(bookJson)

            const textUrl = bookJson.formats['text/plain; charset=us-ascii'];
            if (!textUrl) {
                console.log("Plain text version of the book is not available.");
                rl.close();
                return;
            }

            const textResponse = await fetch(textUrl);
            const bookText = await textResponse.text();

            // console.log("Book Content:");
            // console.log(bookText);

            // CoPilot
            const words = bookText.split(/\s+/);
            const pageSize = 200;
            let currentPage = 0;

            function displayPage(page){
                const start = page * pageSize;
                const end = start + pageSize;
                const pageContent = words.slice(start, end).join(' ');
                console.log(`Page ${page + 1}`);
                console.log(pageContent);
                console.log(`End of Page ${page + 1}`);
            }

            displayPage(currentPage);

            const rlPagination = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            function askForNavigation() {
                rlPagination.question("Type 'next' or 'prev': ", (command) => {
                    if (command === 'next'){
                        if ((currentPage + 1) * pageSize < words.length) {
                            currentPage++;
                            displayPage(currentPage);
                        } else {
                            console.log("You are already on the last page.");
                        }
                    }
                    else if (command === 'prev'){
                        if (currentPage > 0){
                            currentPage--;
                            displayPage(currentPage);
                        } else {
                            console.log("You are already on the first page.");
                        }
                    }
                    else if (command === 'exit') {
                        console.log("Exiting book reader...")
                        rlPagination.close();
                        return;
                    }
                    else {
                        console.log("Invalid Command. Try again ('next'/'prev')");
                    }
                    askForNavigation();
                }); 
            }
            askForNavigation();

            rl.close();

        })
    } catch (error) {
        console.log("An error occurred: ", error)
    }
    
}

// Copilot 
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Enter a book title or author to search: ", (query) => { 
    getData(query);
    rl.close();

});
// For results, we need text/plain result for book results
// We need to use square bracket notation to get the book result