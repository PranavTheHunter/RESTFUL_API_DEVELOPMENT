const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs')
const books = require('./MOCK_DATA.json'); // Assuming your mock data is in a JSON file
const app = express();
const PORT = 8000;

// Enable CORS
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Parse incoming JSON
app.use(express.json());

// API -> JSON
app.get('/api/books', (req, res) => {
    return res.json(books);
});

// Browsers -> HTML (Table format)
app.get('/books', (req, res) => {
    const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Books</title>
            <style>
                table {
                    width: 80%;
                    margin: 20px auto;
                    border-collapse: collapse;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #f4f4f4;
                }
                tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                tr:hover {
                    background-color: #f1f1f1;
                }
            </style>
        </head>
        <body>
            <h1 style="text-align: center;">Books</h1>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Genre</th>
                        <th>Price</th>
                        <th>DOI</th>
                    </tr>
                </thead>
                <tbody>
                    ${books.map(book => `
                        <tr>
                            <td>${book.id}</td>
                            <td>${book.title}</td>
                            <td>${book.author}</td>
                            <td>${book.genre}</td>
                            <td>${book.price}</td>
                            <td>${book.DOI}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
    `;
    return res.send(html);
});

// DYNAMIC PATH ALLOCATION for individual book
app.get('/api/books/:id', (req, res) => {
    const id = Number(req.params.id);
    const book = books.find((book) => book.id === id);

    if (book) {
        return res.json(book);
    } else {
        return res.status(404).json({ error: 'Book not found' });
    }
});

// ADDING BOOKS
app.post('/api/books', (req, res) => {
    const { id, title, author, price, DOI, genre } = req.body;

    // Validate input
    if (!id || !title || !author || !price || !DOI || !genre) {
        return res.status(400).json({ error: 'All fields are required (id, title, author, price, DOI, genre).' });
    }

    // Check if book with the same ID already exists
    const existingBook = books.find((book) => book.id === id);
    if (existingBook) {
        return res.status(400).json({ error: `A book with ID ${id} already exists.` });
    }

    // Create a new book object and add it to the array
    const newBook = { id, title, author, price, DOI, genre };
    books.push(newBook);

    return res.status(201).json({
        message: 'Book added successfully',
        book: newBook,
    });
});


// PATCH UPDATE
app.patch('/api/books/:id', (req, res) => {
    const { id } = req.params;
    const book = books.find((book) => book.id === parseInt(id));

    if (!book) {
        return res.status(404).json({ error: 'Book not found' });
    }

    const updatedData = req.body;
    Object.assign(book, updatedData); // Update properties with the new data

    return res.json({ message: 'Book updated successfully', book });
});

// DELETE BOOK
app.delete('/api/books/:id', (req, res) => {
    const { id } = req.params;
    const bookIndex = books.findIndex((book) => book.id === parseInt(id));

    if (bookIndex === -1) {
        return res.status(404).json({ error: 'Book not found' });
    }

    books.splice(bookIndex, 1); // Remove the book from the array

    return res.json({ message: 'Book deleted successfully' });
});


app.get('/api_tester.html', (req, res) => {
    const filePath = path.join(__dirname, 'api_tester.html');
    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
            res.status(500).send('Error loading file.');
        } else {
            res.send(data);
        }
    });
});
// Start the server
app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
