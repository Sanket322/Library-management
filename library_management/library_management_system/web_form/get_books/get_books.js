frappe.ready(function() {
	book_name = frappe.web_form.get_value(['Article Name']);
    quentity = frappe.web_form.get_value(['Total quentity']);
	
	async function insertBook(bookdetails) {
		const response = await fetch("http://library.localhost:8002/api/resource/Books",
			{
				method: 'POST',
				headers: {
					'Content-type': 'application/json',
					'Authorization': 'token 66fefd0e7e69a34:7053a6dc025dd2f',
					'cors': 'no-cors'
				},
				body: JSON.stringify(bookdetails)
			}
		)
		const data = await response.json();
		console.log(data)
	}

	async function getTwentyBooks(book_name) {
		try {
			// console.log('Before calling api')
			const response = await fetch(`https://frappe.io/api/method/frappe-library?title=${book_name}`);
            frappe.msgprint(response)

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}
			const data = await response.json();

			const bookdetail = data.message.map(book => {
				return {
					...book,
					'doctype': 'Books',
					'article_name': book.title,
					'author' : book.authors,
					'status' : 'Available',
					'route' : book.title,
					'price' : 100,
					 authors : undefined,
					 title: undefined
				};
			});

			return bookdetail

		} catch (error) {
			console.error('Error:', error);
		}
	}

	async function temp() {
		
		if(book_name == ""){
			data = await getTwentyBooks("")
		}
		else if(book_name != ""){
			data = await getTwentyBooks(book_name)
		}

		// for(let i=0;i<quentity;i++){
		// 	insertBook(data[i])
		// }
	}
  
	temp()
})