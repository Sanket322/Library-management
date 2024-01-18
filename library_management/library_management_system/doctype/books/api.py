import requests

# Replace these values with your actual Frappe instance details
frappe_url = 'http://library.localhost:8002'
api_key = '7053a6dc025dd2f'

# Set the endpoint for creating a new book record (replace 'Book' with your actual DocType)
endpoint = f'{frappe_url}/api/resource/Books'

# Set headers with authentication details
headers = {
    'Authorization': f'Bearer {api_key}',
    'Content-Type': 'application/json',
}

# Sample book data
book_data = {
    'doctype': 'Books',  # Replace 'Book' with your actual DocType
    'title': 'Jungle Book',
    'author': 'Jadugar',
    'isbn': '1234',
    # Add other book details as needed
}

# Make the POST request
response = requests.post(endpoint, headers=headers, json=book_data)

# Check the response
if response.status_code == 200:
    print('Book created successfully!')
else:
    print('Failed to create book. Status code:', response.status_code)
    print(response.text)
