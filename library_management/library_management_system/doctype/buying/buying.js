// Copyright (c) 2024, sanket and contributors
// For license information, please see license.txt
var newBookDetail = []

frappe.ui.form.on("Buying", {

    before_save: async function (frm) {

        let existingBooks = await getDatabaseBooks();

        if (frm.doc.quentity <= 0) frappe.throw("Quentity Can not be zero or negative")

        let userRequiredQuentity = frm.doc.quentity || 5;
        title = frm.doc.book_name ? frm.doc.book_name.trim() : "";
        let page = 1;
        let previousLength = 0, afetrLength = 0;

        while (afetrLength < userRequiredQuentity) {
            previousLength = newBookDetail.length
            let api = `https://frappe.io/api/method/frappe-library?page=${page}&title=${title}`
            // console.log(api);

            newBookDetail = await checkNewBooks(api, newBookDetail, existingBooks)
            afetrLength = newBookDetail.length

            if (afetrLength == previousLength) break;
            page += 1;
        }

        // console.log(existingBooks);
        // console.log(newBookDetail);

    },

    before_submit: async function (frm) {

        let userRequiredQuentity = frm.doc.quentity || 5;
        let count=0;

        for (let i = 0; i < Math.min(newBookDetail.length, userRequiredQuentity); i++) {
            count++;
            let savedBook = await insertBook(newBookDetail[i])
        }
        if(count == Math.min(newBookDetail.length, userRequiredQuentity) ){
            frappe.msgprint("books imported successfully");
        }
    }
});

async function checkNewBooks(api, newBookDetail, existingBooks) {

    var booksdetail = await fetchBooks(api)

    for (let i = 0; i < booksdetail.length; i++) {
        let flag = 0;
        for (let j = 0; j < existingBooks.length; j++) {

            if (existingBooks[j].name === booksdetail[i].article_name) {
                flag = 1;
                break;
            }
        }
        if (flag != 1) newBookDetail.push(booksdetail[i])
    }
    return newBookDetail;
}

async function insertBook(booksdetails) {

    // console.log(booksdetails)

    try {
        const response = await fetch("http://library.localhost:8002/api/resource/Books",
            {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Authorization': 'token 66fefd0e7e69a34:7053a6dc025dd2f',
                    'cors': 'no-cors'
                },
                body: JSON.stringify(booksdetails)
            }
        )

        if (response.status === 409) {
            console.warn(`Book already exists: ${booksdetails.title}`);
        } else if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        } else {
            const insertedBooksDetail = await response.json();
            console.log(insertedBooksDetail);
        }
    }
    catch (error) {
        frappe.throw('Error While Inserting the data in database')
        return;
    }
}

async function fetchBooks(api) {
    try {
        const response = await fetch(api);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        const booksdetail = data.message.map(book => {
            return {
                'doctype': 'Books',
                'article_name': book.title,
                'author': book.authors,
                'status': 'Available',
                'route': book.isbn,
                'price': 100,
                'published': 1,
                authors: undefined,
                title: undefined
            };
        });

        return booksdetail

    } catch (error) {
        frappe.throw('Error While fetching the data,error is : ', error);
        return error
    }
}

//get books from database - which are already available
async function getDatabaseBooks() {
    try {
        const response = await fetch("http://library.localhost:8002/api/resource/Books",
            {
                method: 'GET',
                headers: {
                    'Content-type': 'application-json',
                    'Authorization': 'token 66fefd0e7e69a34:7053a6dc025dd2f'
                }
            }
        )

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const booksInDatabase = await response.json();
        return booksInDatabase.data
    }
    catch (error) {
        frappe.throw('Error While getting the data from database');
    }
}


