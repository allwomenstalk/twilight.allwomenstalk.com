async function fetchData(postid, page) {
  console.log(JSON.stringify({ postid:postid, page:page }))

    try {
      const response = await fetch("https://us-central1.gcp.data.mongodb-api.com/app/allwomenstalk-ebogu/endpoint/elaborate", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postid:postid, page:page }),
        redirect: 'follow'
      });
      const result = await response.text();
      console.log('result', JSON.parse(result))
      return result;
    } catch (error) {
      console.log('error', error);
      return null;
    }
  }

  console.log('elaborate.js started onload');

const elaborateDivs = document.querySelectorAll('.elaborate');

elaborateDivs.forEach((elaborateDiv, index) => {
  const button = document.createElement('button');
  button.innerText = 'Elaborate ...';
  button.classList.add('_elaborate', 'relative', 'inline-flex', 'items-center', 'gap-x-1.5', 'rounded-md', 'px-3', 'py-2', 'text-sm', 'font-semibold', 'ring-1', 'ring-inset', 'ring-gray-300', 'hover:bg-gray-50', 'hover:text-gray-900', 'focus:z-10');
  button.setAttribute('data-index', index); // Set custom attribute with the index value

  button.addEventListener('click', async () => {
    button.disabled = true;
    button.innerText = 'Loading...';

    const postid = document.querySelector('head').getAttribute('data-postid');
    const page = button.getAttribute('data-index'); // Retrieve the index value from the button
    const result = await fetchData(postid, page);
    const obj = JSON.parse(result);

    // Handle the response as needed for the 'elaborate' div
    // Example: Update the innerHTML of the 'elaborate' div with the response
    elaborateDiv.innerHTML = obj.response;
  });

  elaborateDiv.appendChild(button);
});
