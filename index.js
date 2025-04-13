// Gab Borja & Drew Baine
const readline = require('readline');
const url = 'https://gutendex.com/books?search=';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


async function fetchErrorHandling(url) {
    try {
        const response = await fetch(url);

        // Check if the response is OK
        if (!response.ok) {
            throw new Error(`Error with fetching URL: ${response.status} - ${response.statusText}`);
        }

        // Check if the response is JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            const text = await response.text(); // Consume the body only once
            console.log(`Raw response: ${text}`);
            throw new Error(`Unexpected response format: ${text}`);
        }
    } catch (error) {
        console.log(`An error occurred while fetching the book data: ${error.message}`);
        return null;
    }
}

// Copilot Help
function displayMenu(){
    console.log("\nMain Menu:");
    console.log("1. Search for a book");
    console.log("2. View Recent Books");
    console.log("3. Quit");

    rl.question("Choose an option: ", (choice) => {
        if (choice === '1' || choice === 'Search' || choice === 'search'){
            rl.question("Enter a book title or author to search: ", (query) => {
                getData(query);
                
            });
        } else if (choice === '2') {
            displayRecentBooksMenu();
        } else if (choice === '3' || choice === 'Quit' || choice === 'quit') {
            console.log('"Reading gives you the ability to reach higher ground and keep climbing," - Oprah Winfrey ');
            console.log('Goodbye!');
            rl.close();
        } else {
            console.log("Invalid choice. Try again.");
            
            displayMenu();
        }
    });
}

async function fetchAndDisplayBook(bookID) {
    try {
        // Fetch book details
        const bookDetails = await fetchErrorHandling(`https://gutendex.com/books/${bookID}`);
        if (!bookDetails) {
            console.log("Failed to fetch book details.");
            return;
        }

        // Gets the plain text URL
        const textUrl = bookDetails.formats['text/plain; charset=us-ascii'];
        if (!textUrl) {
            console.log("Plain text version of the book is not available.");
            return;
        }

        // Fetch the book text
        const response = await fetch(textUrl); // Copilot
        if (!response.ok) {
            console.log("Failed to fetch the book text.");
            return;
        }

        // Split the book text into words
        const bookText = await response.text();
        const words = bookText.split(/\s+/); // Copilot
        console.log(`Total words: ${words.length}`); // Debugging
        const pageSize = 200; // Number of words per page
        let currentPage = 0;

        // Function to display a page
        function displayPage(page) {
            const start = page * pageSize;
            const end = start + pageSize;
            const pageContent = words.slice(start, end).join(' ');
            console.log(`\n--- Page ${page + 1} ---\n`);
            console.log(pageContent);
            console.log(`\n--- End of Page ${page + 1} ---\n`);
        }

        // Display the first page
        displayPage(currentPage);

        // Function to handle navigation
        function askForNav() {
            rl.question("Type 'next', 'prev', or 'exit': ", (command) => {
                if (command === 'next') {
                    if ((currentPage + 1) * pageSize < words.length) {
                        currentPage++;
                        displayPage(currentPage);
                    } else {
                        console.log("You are on the last page.");
                    }
                } else if (command === 'prev') {
                    if (currentPage > 0) {
                        currentPage--;
                        displayPage(currentPage);
                    } else {
                        console.log("You are already on the first page.");
                    }
                } else if (command === 'exit') {
                    console.log("Exiting book reader...");
                    displayMenu(); // Return to the main menu
                    return;
                } else {
                    console.log("Invalid command. Try 'next', 'prev', or 'exit'.");
                }
                askForNav(); // Ask for navigation again
            });
        }

        // Start navigation
        askForNav();
    } catch (error) {
        console.log("An error occurred while fetching and displaying the book:", error.message);
    }
}

async function getData(str){
    try {
        const json = await fetchErrorHandling(url + str);
        if (!json || json.results.length === 0) {
            console.log("Sorry. No books found.");
            displayMenu();
            return;
        }

        console.log(`Search Results: (${json.count})`)
        json.results.forEach((book, index) => {
            console.log(`${index + 1}. ${book.id} - ${book.title} by ${book.authors.map(author => author.name).join(', ')}`);
        });

        rl.question("Choose a book ID: ", async (answer) => {
            const choice = parseInt(answer);
            // console.log(choice);
            
            const selectedBook = json.results.find(book => book.id === choice); // Copilot
            if (!selectedBook) {
                console.log("Sorry. That book ID is not connected with any book.");
                displayMenu();
                return;
            }
            console.log(`You selected ${selectedBook.title}`);
            addToRecentBooks(selectedBook);
            fetchAndDisplayBook(selectedBook.id);
            // displayMenu();
            
        });
    } catch (error) {
        console.log("An error occurred: ", error)
        displayMenu();
    }
    
}

// For results, we need text/plain result for book results
// We need to use square bracket notation to get the book result


const recentBooks = [];

function addToRecentBooks(book){
    const existingIndex = recentBooks.findIndex(b => b.id === book.id); // Copilot
    if (existingIndex !== -1) {
        recentBooks.splice(existingIndex, 1);
    }

    recentBooks.unshift(book);

    if (recentBooks.length > 10) {
        recentBooks.pop();
    }
}
// Copilot
function displayRecentBooksMenu(){
    if (recentBooks.length === 0){
        console.log("No recent books available.");
        displayMenu();
        return;
    }

    console.log("\n Recent Books:");
    recentBooks.forEach((book, index) => {
        console.log(`${index + 1}. ${book.title} by ${book.authors.map(author => author.name).join(', ')}`);
    });

    // const rlRecent = readline.createInterface({
    //     input: process.stdin,
    //     output: process.stdout
    // });

    rl.question("Select a book by number ", async (answer) => {
        if (answer.toLowerCase() === 'exit') {
            displayMenu();
            return;
        }

        const choice = parseInt(answer) - 1;
        if (choice >= 0 && choice < recentBooks.length) {
            const selectedBook = recentBooks[choice];
            console.log(`You selected ${selectedBook.title}`);
            await fetchAndDisplayBook(selectedBook.id);
        } else {
            console.log("Invalid choice. Returning to the main menu");
        }
        displayMenu();
    });
}

displayMenu();