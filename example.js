const text = await fetch('https://gutendex.com/books/221');
    // Grabs the Book Result of plain
    const plain = await text.json();
    console.log("Book Info")
    console.log(plain)
    const text_results = plain.formats['text/plain; charset=us-ascii']
    console.log("Book in URL");
    console.log(text_results);
    const text_url = await fetch(text_results);
    console.log(plain.title)
    const final = await text_url.text();
    console.log(final)