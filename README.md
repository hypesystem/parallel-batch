parallel-batch
==============

This tiny library builds on top of [async](https://github.com/caolan/async), to add easy batch-running.

Installation
------------

This is a node module. You install it with npm:

    npm install parallel-batch

Usage
-----

Parallel-batching makes it easy for you to split an array in *batches* (smaller arrays of at most a specified size), and running a function on each batch.
The final callback lets you merge the results as you wish.

The library exposes a single function:

```js
var parallelBatch = require("parallel-batch");
```

The function takes four arguments:

```js
parallelBatch(array, batchSize, iterator, callback);
```

- **array** (Array) is the array to batch and iterate over.
- **batchSize** (Number) is the maximum size of each batch.
- **iterator** (Function) is the function that is run for each batch.
  It must take two arguments: a batch and a callback.
  The batch is an array that is at most *batchSize* big, containing elements from *array*. 
  The callback should be the last thing called from the iterator, and is called in the normal node-style:
  the first argument is an error if one occurred, `null` otherwise; the second argument contains the result.
- **callback** (Function) is the final callback that is called when all the iterators have concluded.
  The callback takes two arguments: an error (which will be `null` if everything went as it should), and an array of results.
  There is one element in the result array per batch.

When should I use parallel-batch?
---------------------------------

In the example below, you'll see a good use case for this library: the API we are using has an artificial limit per request.

You shouldn't use this library if you simply want to throttle your code, so it doesn't make too many requests at a time.
Async has a much better built-in alternative for that, namely `parallelLimit`, `seriesLimit`, and `eachLimit`.
These functions make sure that no more than the `limit` parallel requests are ongoing at the same time, a different use case from this library.

Example: Batched requests
-------------------------

Given a really big list of users, we want to delete them all.
We are using an API that has a mass-delete function, but limits the number of users you can delete to 100 per request.

```js
parallelBatch(usersToDelete, 100, function(batch, callback) {
	var ids = _.map(usersToDelete, "id");
	request.post({
		uri: uri+"/mass-delete",
		body: JSON.stringify({
			users: usersToDelete
		})
	}, function(error, httpResponse, body) {
		if(error) {
			return callback(error);
		}
		
		if(httpResponse.statusCode == 200) {
			var names = _.map(usersToDelete, "name");
			return callback(null, names);
		}
		
		callback(new Error("Got non-200 error code ("+httpResponse.statusCode+") on delete: "+body));
	});
}, function(error, results) {
	if(error) {
		return console.error("Failed to delete users", error);
	}
	
	var allNames = _.flatten(results);
	console.log("Deleted the following users:", allNames);
});
```

This example shows a very simple way of merging the results of each iterator: simply flattening the results.
