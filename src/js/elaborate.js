async function fetchData(postid, page) {
    try {
      const response = await fetch("https://us-central1.gcp.data.mongodb-api.com/app/allwomenstalk-ebogu/endpoint/elaborate", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postid:postid, page:page }),
        redirect: 'follow'
      });
  
      const result = await response.text();
      return result;
    } catch (error) {
      console.log('error', error);
      return null;
    }
  }


    console.log('elaborate.js started onload')
    setTimeout(() => {
      const postBlocks = document.querySelectorAll('.post');
      const postid = document.querySelector('head').getAttribute('data-postid');
      console.log('adding buttons to postid', postid);
      postBlocks.forEach((p, index) => {
        if (index >= 1 && index<postBlocks.length-2) { 
          const button = document.createElement('button');
          button.innerText = 'Elaborate ...';
          button.classList.add('_elaborate','relative', 'inline-flex', 'items-center', 'gap-x-1.5', 'rounded-md', 'px-3', 'py-2', 'text-sm', 'font-semibold', 'ring-1', 'ring-inset', 'ring-gray-300', 'hover:bg-gray-50', 'hover:text-gray-900', 'focus:z-10');
  
          button.addEventListener('click', async () => {
            button.disabled = true;
            button.innerText = 'Loading...';
  
            const page = index;
            const result = await fetchData(postid, page);
            const obj = JSON.parse(result);
  
            const resultTextNode = document.createTextNode(obj.response);
  
            const resultBlock = document.createElement('p');
            resultBlock.classList.add('italic', 'opacity-70')
            resultBlock.appendChild(resultTextNode);
  
            // Add the response text inside .post block as an extra <p> block
            p.insertBefore(resultBlock, p.querySelector('button.like'));
  
            button.parentNode.removeChild(button);
          });
  
          // Attach the button to .post block before the Like button
          p.insertBefore(button, p.querySelector('button.like'));
        }
      });
    }, 2000); // Delay of 2 seconds

