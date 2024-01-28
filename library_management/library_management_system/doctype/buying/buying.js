// Copyright (c) 2024, sanket and contributors
// For license information, please see license.txt
var existingBooks = []

frappe.ui.form.on("Buying", {

    before_save: async function (frm) {

        if (frm.doc.quentity <= 0) frappe.throw("Quentity Can not be zero or negative")
        const r = await frm.call({
            doc: frm.doc,
            method: 'getDatabaseBooks'
        });
        existingBooks = r.message;
    },

    before_submit: async function (frm) {

        let userRequiredQuentity = frm.doc.quentity || 5;
        let title = frm.doc.book_name ? frm.doc.book_name.trim() : "";
        let page = 1,afetrLength = 0;
        var newBookDetail = [];

        while (afetrLength < userRequiredQuentity && page <= 200) {

            let api = `https://frappe.io/api/method/frappe-library?page=${page}&title=${title}`

            newBookDetail = await checkNewBooks(api, newBookDetail, existingBooks)
            afetrLength = newBookDetail.length

            page += 1;
        }

        const r = await frm.call({
            doc: frm.doc,
            method: 'insertBooks',
            args: {
                books: JSON.stringify(newBookDetail),
                quentity: Math.min(newBookDetail.length, userRequiredQuentity)
            }
        });

        if (r.message == "Data inserted successfully") {
            frappe.msgprint("Books imported successfully");
        } else {
            frappe.msgprint("Books import caught some problem");
        }
    }
});

async function checkNewBooks(api, newBookDetail, existingBooks) {

    var booksdetail = await fetchBooks(api)

    for (let i = 0; i < booksdetail.length; i++) {
        let j = 0;
        for (j = 0; j < existingBooks.length; j++) {

            if (existingBooks[j]['name'].trim() == booksdetail[i]['article_name'].trim()
                || existingBooks[j]['isbn'] == booksdetail[i]['isbn']) {
                break;
            }
        }
        if (j == existingBooks.length) newBookDetail.push(booksdetail[i])
    }
    return newBookDetail;
}

async function fetchBooks(api) {
    try {
        const response = await fetch(api);

        if (!response.ok) {
            frappe.throw(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        const booksdetail = data.message.map(book => {
            return {
                'doctype': 'Book',
                'article_name': book.title,
                'author': book.authors,
                'status': 'Available',
                'isbn': book.isbn,
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
        return;
    }
}


