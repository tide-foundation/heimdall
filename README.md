# heimdall

## Usage
Add this line to the top of your html page
```<script type="module" src="https://tide-foundation.github.io/heimdall/tide.js"></script>```
Inside the ```<script>``` tags, add a function called ```heimdall()``` like this:
```
<script>
        function heimdall(obj){ // i get called from inside tide.js
            // do stuff with cvk
            localStorage.setItem("CVK", obj.CVK);
            localStorage.setItem("UID", obj.UID);

            window.location.replace(window.location.href + "main.html"); // redirect to main page
        }
    </script>
```
The above function ```heimdall``` will be called by either the sign in/up Tide functions, with an object cosisiting of:
```
{
  CVK: BigInt <- The actual CVK of the user, don't steal it from their browser!
  UID: string <- UID of the user for Id purposes
}
```

That's it! This SDK is great for Single Page Apps which want to encrypt user secrets with a key THEY DON'T HOLD. Instead, the Tide Enclave handles retrieving the key from the Tide Network, which it then passes to the heimdall function YOU implement. You can then choose what to do with the user's CVK or UID.
